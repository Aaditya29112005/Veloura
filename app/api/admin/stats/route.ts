import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth-helper";

export async function GET() {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Run parallel queries for dashboard indicators
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      allOrders,
      lowStockProducts,
      categories,
    ] = await Promise.all([
      db.order.count(),
      db.product.count(),
      db.user.count({ where: { role: "USER" } }),
      db.order.findMany({
        where: { NOT: { status: "CANCELLED" } },
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
      }),
      db.product.findMany({
        where: { stock: { lte: 10 } },
        include: { category: true },
        take: 5,
      }),
      db.category.findMany({
        include: { products: true },
      }),
    ]);

    // Calculate total revenue
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate sales by category
    const categorySalesMap: Record<string, number> = {};
    for (const cat of categories) {
      categorySalesMap[cat.name] = 0;
    }

    for (const order of allOrders) {
      for (const item of order.items) {
        const catName = item.product.category.name;
        categorySalesMap[catName] = (categorySalesMap[catName] || 0) + item.price * item.quantity;
      }
    }

    const salesByCategory = Object.entries(categorySalesMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Calculate monthly revenue trend (last 6 months)
    const monthlyRevenueMap: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyRevenueMap[key] = 0;
    }

    for (const order of allOrders) {
      const orderDate = new Date(order.createdAt);
      const key = `${months[orderDate.getMonth()]} ${orderDate.getFullYear().toString().slice(-2)}`;
      if (monthlyRevenueMap[key] !== undefined) {
        monthlyRevenueMap[key] += order.totalAmount;
      }
    }

    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([name, revenue]) => ({
      name,
      revenue,
    }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
      },
      monthlyRevenue,
      salesByCategory,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
