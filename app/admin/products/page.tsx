"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Upload, X, ShieldCheck, ShieldAlert } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [sizeInput, setSizeInput] = useState("S, M, L, XL");
  const [colorInput, setColorInput] = useState("Black, White, Charcoal");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load catalog items and categories
  const loadData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("/api/products?status=ALL&limit=100"), // admin can see all draft/active
        fetch("/api/categories"),
      ]);

      if (resProd.ok) {
        const prodData = await resProd.json();
        setProducts(prodData.products || []);
      }
      if (resCat.ok) {
        const catData = await resCat.json();
        setCategories(catData || []);
      }
    } catch (err) {
      toast.error("Failed to load catalog data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setStatus("ACTIVE");
    setSizeInput("S, M, L, XL");
    setColorInput("Black, White, Charcoal, Cream");
    setImages([]);
    
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    } else {
      setCategoryId("");
    }
    
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price.toString());
    setStock(p.stock.toString());
    setCategoryId(p.categoryId);
    setStatus(p.status || "ACTIVE");
    setSizeInput(p.sizes?.join(", ") || "");
    setColorInput(p.colors?.join(", ") || "");
    setImages(p.images?.map((img: any) => img.url) || []);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImages((prev) => [...prev, data.url]);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (err) {
      toast.error("Network error during file upload");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !stock || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const sizesArray = sizeInput.split(",").map((s) => s.trim()).filter(Boolean);
    const colorsArray = colorInput.split(",").map((c) => c.trim()).filter(Boolean);

    // If no images uploaded, add a generic placeholder image so the app looks styled
    const finalImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80"];

    const payload = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId,
      sizes: sizesArray,
      colors: colorsArray,
      images: finalImages,
      status,
    };

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? "Product updated" : "Product created");
        setIsModalOpen(false);
        loadData(); // reload
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Action failed");
      }
    } catch (err) {
      toast.error("An unexpected network error occurred");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the product "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Product deleted successfully");
        loadData();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  if (loading && products.length === 0) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide uppercase text-white">Manage Products</h1>
          <p className="text-zinc-500 text-xs font-light mt-1">
            Create, update, and manage details of e-commerce catalog items.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Table list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Image</th>
                <th className="py-4 px-6 font-semibold">Garment Name</th>
                <th className="py-4 px-6 font-semibold">Category</th>
                <th className="py-4 px-6 font-semibold">Price</th>
                <th className="py-4 px-6 font-semibold">Stock</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/50">
              {products.map((p) => {
                const primaryImage = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;
                return (
                  <tr key={p.id} className="text-zinc-300 hover:text-white transition-colors">
                    <td className="py-3 px-6">
                      <div className="w-9 h-12 rounded overflow-hidden bg-zinc-950 border border-zinc-800">
                        {primaryImage && <img src={primaryImage} alt="pic" className="object-cover w-full h-full" />}
                      </div>
                    </td>
                    <td className="py-3 px-6 font-medium max-w-[200px] truncate">{p.name}</td>
                    <td className="py-3 px-6 font-light">{p.category?.name}</td>
                    <td className="py-3 px-6 font-semibold">${p.price.toFixed(2)}</td>
                    <td className="py-3 px-6">
                      <span className={`font-bold ${p.stock <= 5 ? "text-amber-500" : "text-zinc-400"}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 ${p.status === "ACTIVE" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-800 text-zinc-450 border-zinc-700"}`}>
                        {p.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-amber-400 rounded-md transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-red-400 rounded-md transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT FORM MODAL CONTAINER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-white">
              {editingId ? "Edit Garment Details" : "Register New Garment"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* Product name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Garment Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white"
                    placeholder="e.g. Silk Button-Down Shirt"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white cursor-pointer"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Garment Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-xs text-white"
                  rows={3}
                  placeholder="Details regarding fabrics, silhouettes, lapels..."
                  required
                />
              </div>

              {/* Price, Stock, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Price ($USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white"
                    placeholder="e.g. 149.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Stock Count *</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white"
                    placeholder="e.g. 15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Shopper visible)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Sizes and Colors (comma-separated lists) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Available Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white"
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Available Colors (comma separated)</label>
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white"
                    placeholder="Black, White, Charcoal"
                  />
                </div>
              </div>

              {/* Image Upload list */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">Garment Images</label>
                
                {/* Drag-and-drop / Upload field */}
                <div className="border-2 border-dashed border-zinc-850 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-950 text-center mb-3">
                  <Upload className="w-5 h-5 text-zinc-550 mb-1.5" />
                  <label className="text-[10px] text-zinc-350 font-semibold cursor-pointer hover:text-amber-400">
                    <span>{uploadingImage ? "Uploading file..." : "Choose Image File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  <p className="text-[9px] text-zinc-500 font-light mt-0.5">Saves image locally in /public/uploads directory</p>
                </div>

                {/* Uploaded images preview list */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {images.map((url, idx) => (
                      <div key={idx} className="relative w-14 aspect-[3/4] rounded-md overflow-hidden bg-zinc-950 border border-zinc-850">
                        <img src={url} alt="product" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1 -right-1 p-0.5 bg-black/80 rounded-full text-zinc-500 hover:text-red-400 hover:scale-105 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 text-xs rounded-lg hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-zinc-200"
                >
                  {editingId ? "Save Changes" : "Create Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
