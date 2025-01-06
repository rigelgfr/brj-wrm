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
)
-- Update existing rows or insert new rows
-- If a row for the same warehouse, year, month, week does not exist, it will be added
-- If the row exists, it will be updated with the new aggregated data
INSERT INTO inbound_aggregated (warehouse, year, month, week_in_month, total_volume, unique_truck_count, total_truck_count)
SELECT 
    warehouse,
    year,
    month,
    week_in_month,
    total_volume,
    unique_truck_count,
    total_truck_count
FROM AggregatedData
ON CONFLICT (warehouse, year, month, week_in_month)
DO UPDATE SET
    total_volume = EXCLUDED.total_volume,
    unique_truck_count = EXCLUDED.unique_truck_count,
    total_truck_count = EXCLUDED.total_truck_count;
