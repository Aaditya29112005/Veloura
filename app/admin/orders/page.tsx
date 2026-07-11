"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { OrderStatus } from "@prisma/client";
import { Receipt, Search, Eye, Filter } from "lucide-react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders?admin=true");
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
        setFilteredOrders(data || []);
      }
    } catch (err) {
      toast.error("Failed to load global orders list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(term) ||
          o.user?.name.toLowerCase().includes(term) ||
          o.user?.email.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        loadOrders(); // reload
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "PROCESSING":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "SHIPPED":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "DELIVERED":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-zinc-900 rounded w-1/3 animate-pulse" />
        <div className="h-96 bg-zinc-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* View Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wide uppercase text-white">Order Fulfilment</h1>
        <p className="text-zinc-500 text-xs font-light mt-1">
          Monitor recent shopper orders, adjust tracking statuses, and process invoices.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by ID, shopper, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-amber-400"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
        </div>

        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-xs w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] mr-1">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className="bg-zinc-950">ALL Statuses</option>
            <option value="PENDING" className="bg-zinc-950">PENDING</option>
            <option value="PROCESSING" className="bg-zinc-950">PROCESSING</option>
            <option value="SHIPPED" className="bg-zinc-950">SHIPPED</option>
            <option value="DELIVERED" className="bg-zinc-950">DELIVERED</option>
            <option value="CANCELLED" className="bg-zinc-950">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No matching orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Order ID</th>
                  <th className="py-4 px-6 font-semibold">Shopper</th>
                  <th className="py-4 px-6 font-semibold">Date Placed</th>
                  <th className="py-4 px-6 font-semibold">Total Bill</th>
                  <th className="py-4 px-6 font-semibold">Shipment Status</th>
                  <th className="py-4 px-6 font-semibold">Change Status</th>
                  <th className="py-4 px-6 font-semibold text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {filteredOrders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={order.id} className="text-zinc-300 hover:text-white transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-zinc-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-6">
                        <p className="font-semibold">{order.user?.name}</p>
                        <p className="text-[10px] text-zinc-500">{order.user?.email}</p>
                      </td>
                      <td className="py-3.5 px-6 font-light">{dateStr}</td>
                      <td className="py-3.5 px-6 font-semibold">${order.totalAmount.toFixed(2)}</td>
                      <td className="py-3.5 px-6">
                        <span className={`text-[9px] font-bold border rounded-full px-2.5 py-0.5 ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 rounded-md py-1 px-2 text-[10px] text-zinc-350 cursor-pointer focus:border-amber-400 focus:outline-none"
                        >
                          {Object.values(OrderStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="p-1.5 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-amber-400 rounded-md transition-colors inline-block"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
