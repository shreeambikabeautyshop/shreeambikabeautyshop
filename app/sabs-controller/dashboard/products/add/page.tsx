"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiUpload, FiX, FiSave, FiArrowLeft, FiPlus } from "react-icons/fi";
import Link from "next/link";

const DEFAULT_CATEGORIES = [
  "Cosmetics", "Makeup", "Skin Care", "Hair Care",
  "Body Care", "Perfumes", "Electronics", "Purses & Bags", "Wax & Accessories",
];

const DEFAULT_BRANDS = [
  "Lakme", "Maybelline", "SUGAR", "RENEE", "Insight", "6MARS",
  "Swiss Beauty", "Hilary Rhoda", "Nykaa", "Plum", "Vega", "Braun",
  "Lotus", "Biotique", "WOW", "Mamaearth",
];

interface FormData {
  name: string;
  brand: string;
  category: string;
  price: string;
  mrp: string;
  description: string;
  in_stock: boolean;
  featured: boolean;
  trending: boolean;
  tags: string;
}

// Reusable AddableSelect component
function AddableSelect({
  label,
  value,
  onChange,
  options,
  onAddNew,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  onAddNew: (val: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");

  const handleAdd = () => {
    const trimmed = newVal.trim();
    if (!trimmed) return;
    onAddNew(trimmed);
    onChange(trimmed);
    setNewVal("");
    setAdding(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {adding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={`Enter new ${label.toLowerCase()}...`}
            autoFocus
            className="flex-1 border border-brand-primary rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewVal(""); }}
            className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors"
          >
            <FiX />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary bg-white"
            required={required}
          >
            <option value="">{placeholder}</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setAdding(true)}
            title={`Add new ${label}`}
            className="flex items-center gap-1 px-3 py-2.5 bg-brand-light hover:bg-pink-100 text-brand-primary border border-brand-accent rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <FiPlus size={13} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

export default function AddProduct() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);

  const [form, setForm] = useState<FormData>({
    name: "", brand: "", category: "", price: "", mrp: "",
    description: "", in_stock: true, featured: false, trending: false, tags: "",
  });

  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, 5 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(images[idx].preview);
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadImages = async (): Promise<{ urls: string[]; ids: string[] }> => {
    const urls: string[] = [];
    const ids: string[] = [];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "zjlchjal";
    for (const img of images) {
      const fd = new FormData();
      fd.append("file", img.file);
      fd.append("upload_preset", "shreeambika_products");
      fd.append("folder", "shreeambika-products");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Image upload failed");
      const data = await res.json();
      urls.push(data.secure_url);
      ids.push(data.public_id);
    }
    return { urls, ids };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.brand || !form.category || !form.price || !form.mrp) {
      setError("Please fill all required fields.");
      return;
    }
    if (images.length === 0) {
      setError("Please add at least one product image.");
      return;
    }
    try {
      setUploading(true);
      const { urls, ids } = await uploadImages();
      setUploading(false);
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        brand: form.brand,
        category: form.category,
        price: parseFloat(form.price),
        mrp: parseFloat(form.mrp),
        description: form.description.trim(),
        images: urls,
        cloudinary_ids: ids,
        in_stock: form.in_stock,
        featured: form.featured,
        trending: form.trending,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");
      setSuccess(true);
      setTimeout(() => router.push("/sabs-controller/dashboard/products"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setUploading(false);
      setSaving(false);
    }
  };

  const discount = form.price && form.mrp
    ? Math.max(0, Math.floor(((parseFloat(form.mrp) - parseFloat(form.price)) / parseFloat(form.mrp)) * 100))
    : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sabs-controller/dashboard/products" className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
          <FiArrowLeft />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-500 text-sm">Fill in the product details below</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-5 font-medium text-sm">
          ✅ Product added successfully! Redirecting...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-5 text-sm">
          ✗ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">Product Images <span className="text-red-500">*</span></h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-brand-accent group">
                <Image src={img.preview} alt="preview" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiX size={10} />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-brand-primary text-white text-[9px] text-center py-0.5 font-bold">Main</span>
                )}
              </div>
            ))}
            {images.length < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-primary flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-primary transition-colors">
                <FiUpload size={20} />
                <span className="text-[10px]">Add Image</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
          <p className="text-xs text-gray-400">Max 5 images. First image = main display image.</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Lakme Color + Matte Lipstick - Blush Mauve"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AddableSelect
                label="Brand"
                value={form.brand}
                onChange={(val) => setForm((p) => ({ ...p, brand: val }))}
                options={brands}
                onAddNew={(val) => setBrands((prev) => [...prev, val])}
                placeholder="Select Brand"
                required
              />
              <AddableSelect
                label="Category"
                value={form.category}
                onChange={(val) => setForm((p) => ({ ...p, category: val }))}
                options={categories}
                onAddNew={(val) => setCategories((prev) => [...prev, val])}
                placeholder="Select Category"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                placeholder="Product description, benefits, how to use..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary resize-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Tags (comma separated)</label>
              <input type="text" name="tags" value={form.tags} onChange={handleChange}
                placeholder="e.g. matte, lipstick, long-lasting, pink"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary transition-colors" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Selling Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={form.price} onChange={handleChange}
                placeholder="349" min="1" step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">MRP (₹) <span className="text-red-500">*</span></label>
              <input type="number" name="mrp" value={form.mrp} onChange={handleChange}
                placeholder="499" min="1" step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Discount</label>
              <div className="border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50">
                <span className={`font-bold text-lg ${discount > 0 ? "text-green-600" : "text-gray-400"}`}>
                  {discount}% OFF
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">Product Settings</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "in_stock", label: "In Stock", desc: "Product is available" },
              { name: "featured", label: "⭐ Featured", desc: "Show on homepage" },
              { name: "trending", label: "🔥 Trending", desc: "Show in trending section" },
            ].map((toggle) => (
              <label key={toggle.name} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" name={toggle.name}
                  checked={form[toggle.name as keyof FormData] as boolean}
                  onChange={handleChange} className="mt-0.5 accent-brand-primary w-4 h-4" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{toggle.label}</p>
                  <p className="text-xs text-gray-400">{toggle.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-6">
          <Link href="/sabs-controller/dashboard/products"
            className="flex-1 text-center border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={uploading || saving || success}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading Images...</>
            ) : saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
            ) : (
              <><FiSave /> Save Product</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
