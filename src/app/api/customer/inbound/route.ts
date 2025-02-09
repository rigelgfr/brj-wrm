import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const monthName = searchParams.get("month") || new Date().toLocaleString('default', { month: 'long' });
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = months.indexOf(monthName);
    
    // Calculate previous months
    const prevMonth1 = monthIndex === 0 ? 
      { month: months[11], year: year - 1 } : 
      { month: months[monthIndex - 1], year };
    const prevMonth2 = monthIndex <= 1 ? 
      { month: months[10 + monthIndex], year: year - 1 } : 
      { month: months[monthIndex - 2], year };

    // Fetch all three months' data
    const [currentData, prevMonth1Data, prevMonth2Data] = await Promise.all([
      prisma.inbound.findMany({
        where: { year, month: monthName },
        select: {
          area: true,
          customer_name: true,
          volume: true,
          week_in_month: true,
        },
        orderBy: [{ area: 'asc' }, { customer_name: 'asc' }]
      }),
      prisma.inbound.findMany({
        where: { year: prevMonth1.year, month: prevMonth1.month },
        select: { area: true, customer_name: true, volume: true }
      }),
      prisma.inbound.findMany({
        where: { year: prevMonth2.year, month: prevMonth2.month },
        select: { area: true, customer_name: true, volume: true }
      })
    ]);

    const whTypesSet = new Set(currentData.map(d => d.area || ''));
    const whTypes = Array.from(whTypesSet).sort();
    const weeksSet = new Set(currentData.map(d => d.week_in_month).filter(Boolean));
    const weeks = Array.from(weeksSet).sort();

    const allData = whTypes.reduce((acc: any[], whType) => {
      const whData = currentData.filter(d => d.area === whType);
      const customersSet = new Set(whData.map(d => d.customer_name || ''));
      const customers = Array.from(customersSet).sort();
      
      customers.forEach((customer, index) => {
        const customerData = whData.filter(d => d.customer_name === customer);
        
        // Initialize volumes object with all zeros
        const volumes: { [key: string]: number } = {
          [prevMonth2.month]: 0,
          [prevMonth1.month]: 0,
          grandTotal: 0
        };
        
        // Initialize all weeks with 0
        weeks.forEach(week => {
          volumes[`W${week}`] = 0;
        });

        // Calculate previous months totals
        prevMonth2Data
          .filter(d => d.area === whType && d.customer_name === customer)
          .forEach(record => {
            volumes[prevMonth2.month] += Number(record.volume) || 0;
          });

        prevMonth1Data
          .filter(d => d.area === whType && d.customer_name === customer)
          .forEach(record => {
            volumes[prevMonth1.month] += Number(record.volume) || 0;
          });

        // Calculate current month weekly totals and grand total
        customerData.forEach(record => {
          if (record.week_in_month) {
            const weekKey = `W${record.week_in_month}`;
            const volume = Number(record.volume) || 0;
            volumes[weekKey] += volume;
            volumes.grandTotal += volume;
          }
        });

        acc.push({
          wh_type: index === 0 ? whType : '',
          customer_name: customer,
          ...volumes,
          isFirstInGroup: index === 0
        });
      });

      return acc;
    }, []);

    return NextResponse.json({
      data: allData,
      prevMonths: [prevMonth2.month, prevMonth1.month]
    });
  } catch (error) {
    console.error("Error fetching inbound data:", error);
    return NextResponse.json({ error: "Failed to fetch inbound data" }, { status: 500 });
  }
}
