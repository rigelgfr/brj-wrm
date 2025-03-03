export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export async function updateInboundAggregates() {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          WITH UniqueHits AS (
              -- Identifying rows with unique 'id' values (HIT or DUPLICATE)
              SELECT 
                  id,
                  area AS warehouse,
                  year,
                  month,
                  week_in_month,
                  volume,
                  CASE 
                      WHEN COUNT(id) OVER (PARTITION BY id) = 1 THEN 'HIT'
                      ELSE 'DUPLICATE'
                  END AS hit_status
              FROM inbound
          ),
          AggregatedData AS (
              -- Aggregating data based on warehouse, year, month, week_in_month
              SELECT 
                  warehouse,
                  year,
                  month,
                  week_in_month,
                  SUM(volume) AS total_volume,
                  COUNT(CASE WHEN hit_status = 'HIT' THEN 1 END) AS unique_truck_count,
                  COUNT(*) AS total_truck_count
              FROM UniqueHits
              GROUP BY warehouse, year, month, week_in_month
          ),
          -- Get all existing combinations from inbound_aggregated
          ExistingCombinations AS (
              SELECT DISTINCT 
                  warehouse,
                  year,
                  month,
                  week_in_month
              FROM inbound_aggregated
          ),
          -- Combine existing combinations with new data to ensure we don't miss any
          CombinedData AS (
              SELECT 
                  COALESCE(a.warehouse, e.warehouse) as warehouse,
                  COALESCE(a.year, e.year) as year,
                  COALESCE(a.month, e.month) as month,
                  COALESCE(a.week_in_month, e.week_in_month) as week_in_month,
                  COALESCE(a.total_volume, 0) as total_volume,
                  COALESCE(a.unique_truck_count, 0) as unique_truck_count,
                  COALESCE(a.total_truck_count, 0) as total_truck_count
              FROM ExistingCombinations e
              FULL OUTER JOIN AggregatedData a 
                  ON e.warehouse = a.warehouse 
                  AND e.year = a.year 
                  AND e.month = a.month 
                  AND e.week_in_month = a.week_in_month
          )
          -- Update existing rows or insert new rows
          INSERT INTO inbound_aggregated (
              warehouse, 
              year, 
              month, 
              week_in_month, 
              total_volume, 
              unique_truck_count, 
              total_truck_count
          )
          SELECT 
              warehouse,
              year,
              month,
              week_in_month,
              total_volume,
              unique_truck_count,
              total_truck_count
          FROM CombinedData
          ON CONFLICT (warehouse, year, month, week_in_month)
          DO UPDATE SET
              total_volume = EXCLUDED.total_volume,
              unique_truck_count = EXCLUDED.unique_truck_count,
              total_truck_count = EXCLUDED.total_truck_count;
        `;
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating aggregates:', error);
      return { success: false, error };
    } finally {
      await prisma.$disconnect();
    }
  }