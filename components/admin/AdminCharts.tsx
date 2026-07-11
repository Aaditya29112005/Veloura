"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AdminChartsProps {
  monthlyRevenue: { name: string; revenue: number }[];
  salesByCategory: { name: string; value: number }[];
}

const COLORS = ["#d4af37", "#a1a1aa", "#52525b", "#27272a", "#d4d4d8"];

export default function AdminCharts({ monthlyRevenue, salesByCategory }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* 1. Line Chart: Monthly Revenue */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6">
          Sales Trend (Revenue over Time)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                labelStyle={{ fontSize: "11px", fontWeight: "bold", color: "#fafafa" }}
                itemStyle={{ fontSize: "11px", color: "#d4af37" }}
              />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#d4af37" strokeWidth={2} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Pie Chart: Sales by Category */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6">
          Sales Distribution by Category
        </h3>
        <div className="h-72 flex flex-col justify-between">
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={salesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                itemStyle={{ fontSize: "11px", color: "#fafafa" }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: "10px", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
