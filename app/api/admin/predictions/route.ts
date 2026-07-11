import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Fetch orders and products
    const orders = await db.order.findMany({
      include: { items: true, user: true }
    });

    const products = await db.product.findMany();

    // 2. Revenue Prediction (Linear Projection based on monthly order totals)
    const monthlySales: { [month: string]: number } = {};
    orders.forEach(o => {
      const month = o.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthlySales[month] = (monthlySales[month] || 0) + o.totalAmount;
    });

    const months = Object.keys(monthlySales).sort();
    const salesValues = months.map(m => monthlySales[m]);

    let predictedNextMonthRevenue = 4500.0; // Fallback default
    if (salesValues.length >= 2) {
      // Basic linear fit: y = mx + c
      const n = salesValues.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += salesValues[i];
        sumXY += i * salesValues[i];
        sumXX += i * i;
      }
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      predictedNextMonthRevenue = Math.max(0, slope * n + intercept);
    } else if (salesValues.length === 1) {
      predictedNextMonthRevenue = salesValues[0] * 1.15; // Project a 15% increase
    }

    // 3. Low Stock Alerts & Smart Restock Suggestions
    const lowStockAlerts = products
      .filter(p => p.stock <= 5)
      .map(p => {
        // Demand velocity: reorder quantity = purchased count * 1.5 rounded to nearest 10 (min 10)
        const reorderQty = Math.max(10, Math.round((p.purchasedCount * 1.5) / 10) * 10);
        return {
          id: p.id,
          name: p.name,
          stock: p.stock,
          purchasedCount: p.purchasedCount,
          suggestedRestock: reorderQty,
          reason: p.purchasedCount > 25 ? "High sales velocity (Restock Urgent)" : "Standard backup replenishment"
        };
      });

    // 4. Customer Segments
    const userOrdersCount: { [userId: string]: { name: string; email: string; totalSpend: number; count: number } } = {};
    orders.forEach(o => {
      if (!userOrdersCount[o.userId]) {
        userOrdersCount[o.userId] = {
          name: o.user.name,
          email: o.user.email,
          totalSpend: 0,
          count: 0
        };
      }
      userOrdersCount[o.userId].totalSpend += o.totalAmount;
      userOrdersCount[o.userId].count += 1;
    });

    const segments = {
      vip: 0,        // spend > 300
      active: 0,     // 1-2 orders, spend <= 300
      inactive: 0    // Handled below relative to total users
    };

    const topCustomers = Object.values(userOrdersCount)
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    Object.values(userOrdersCount).forEach(c => {
      if (c.totalSpend > 300) segments.vip += 1;
      else segments.active += 1;
    });

    const totalUsers = await db.user.count({ where: { role: "USER" } });
    segments.inactive = Math.max(0, totalUsers - (segments.vip + segments.active));

    // 5. Sales Heatmaps (Hourly sales frequency)
    const hourlyDistribution = Array(24).fill(0);
    orders.forEach(o => {
      const hour = o.createdAt.getHours();
      hourlyDistribution[hour] += 1;
    });

    // Best launch times
    const maxHourIndex = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    const bestLaunchHour = maxHourIndex !== -1 ? `${maxHourIndex}:00 - ${(maxHourIndex + 2) % 24}:00` : "20:00 - 22:00";

    // 6. Click-to-Purchase Heatmap Grid
    const categoryHeatmap = products.reduce((acc: any, p) => {
      const clicks = p.viewsCount;
      const purchases = p.purchasedCount;
      const conversion = clicks > 0 ? (purchases / clicks) * 100 : 0;
      acc.push({
        id: p.id,
        name: p.name,
        clicks,
        purchases,
        conversionRate: parseFloat(conversion.toFixed(1))
      });
      return acc;
    }, []).sort((a: any, b: any) => b.clicks - a.clicks).slice(0, 6);

    // 7. Coupon Analytics
    const coupons = await db.coupon.findMany();
    const couponPerformance = coupons.map(c => ({
      code: c.code,
      useCount: c.usageCount,
      active: c.active,
      type: c.discountType,
      value: c.discountValue
    }));

    return NextResponse.json({
      revenueForecast: {
        currentMonthSales: salesValues[salesValues.length - 1] || 0,
        predictedNextMonthRevenue: parseFloat(predictedNextMonthRevenue.toFixed(2)),
        growthTrend: salesValues.length >= 2 ? (salesValues[salesValues.length - 1] > salesValues[salesValues.length - 2] ? "UP" : "DOWN") : "STABLE"
      },
      lowStockAlerts,
      customerSegments: {
        vip: segments.vip,
        active: segments.active,
        inactive: segments.inactive,
        total: totalUsers
      },
      bestLaunchHour,
      hourlyDistribution,
      topCustomers,
      categoryHeatmap,
      couponPerformance
    });
  } catch (error) {
    console.error("Admin Predictions API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
