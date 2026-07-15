"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { FiUpload, FiX, FiSave, FiArrowLeft, FiPlus, FiZap, FiRefreshCw } from "react-icons/fi";
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

// Reusable AddableSelect
function AddableSelect({
  label, value, onChange, options, onAddNew, placeholder, required,
}: {
  label: string; value: string; onChange: (val: string) => void;
  options: string[]; onAddNew: (val: string) => void;
  placeholder: string; required?: boolean;
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
          <input type="text" value={newVal} onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={`Enter new ${label.toLowerCase()}...`} autoFocus
            className="flex-1 border border-brand-primary rounded-xl px-4 py-2.5 text-sm outline-none" />
          <button type="button" onClick={handleAdd}
            className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors">
            Add
          </button>
          <button type="button" onClick={() => { setAdding(false); setNewVal(""); }}
            className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors">
            <FiX />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select value={value} onChange={(e) => onChange(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary bg-white"
            required={required}>
            <option value="">{placeholder}</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <button type="button" onClick={() => setAdding(true)}
            className="flex items-center gap-1 px-3 py-2.5 bg-brand-light hover:bg-pink-100 text-brand-primary border border-brand-accent rounded-xl text-xs font-semibold transition-colors whitespace-nowrap">
            <FiPlus size={13} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

export default function EditProduct() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", brand: "", category: "", price: "", mrp: "",
    description: "", in_stock: true, featured: false, trending: false, tags: "",
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(({ data }) => {
        const product = data?.find((p: { id: string }) => p.id === id);
        if (product) {
          setForm({
            name: product.name || "",
            brand: product.brand || "",
            category: product.category || "",
            price: String(product.price || ""),
            mrp: String(product.mrp || ""),
            description: product.description || "",
            in_stock: product.in_stock ?? true,
            featured: product.featured ?? false,
            trending: product.trending ?? false,
            tags: (product.tags || []).join(", "),
          });
          setExistingImages(product.images || []);
        }
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Resize image helper
  const resizeImage = (file: File): Promise<{ base64: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve({ base64: canvas.toDataURL("image/jpeg", 0.75).split(",")[1], mimeType: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = url;
    });

  // Re-generate all data with AI using existing first image
  const handleRegenerate = async () => {
    // Use new image if uploaded, else fetch existing first image
    setError(""); setAiLoading(true); setAiProgress(10);
    try {
      let base64 = ""; let mimeType = "image/jpeg";

      if (newImages.length > 0) {
        // Use newly uploaded image
        const resized = await resizeImage(newImages[0].file);
        base64 = resized.base64; mimeType = resized.mimeType;
      } else if (existingImages.length > 0) {
        // Fetch existing Cloudinary image and resize
        setAiProgress(20);
        const response = await fetch(existingImages[0]);
        const blob = await response.blob();
        const file = new File([blob], "product.jpg", { type: blob.type });
        const resized = await resizeImage(file);
        base64 = resized.base64; mimeType = resized.mimeType;
      } else {
        throw new Error("No image available to analyze");
      }

      setAiProgress(45);
      const res = await fetch("/api/admin/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      setAiProgress(85);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI regeneration failed");

      const d = json.data;
      const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

      setForm((prev) => ({
        ...prev,
        name: d.name || prev.name,
        brand: d.brand || prev.brand,
        category: d.category || prev.category,
        price: d.price ? String(d.price) : prev.price,
        mrp: d.mrp ? String(d.mrp) : prev.mrp,
        description: d.description || prev.description,
        tags: Array.isArray(d.tags) ? d.tags.join(", ") : prev.tags,
      }));

      if (d.brand && !brands.includes(d.brand)) setBrands((b) => [...b, d.brand]);
      if (d.category && !categories.includes(d.category)) setCategories((c) => [...c, d.category]);

      setAiProgress(100);
      setTimeout(() => setAiProgress(0), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI regeneration failed");
      setAiProgress(0);
    } finally {
      setAiLoading(false);
    }
  };

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + newImages.length;
    const toAdd = files.slice(0, Math.max(0, 5 - total));
    setNewImages((prev) => [...prev, ...toAdd.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "zjlchjal";
    for (const img of newImages) {
      const fd = new FormData();
      fd.append("file", img.file);
      fd.append("upload_preset", "shreeambika_products");
      fd.append("folder", "shreeambika-products");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
      const data = await res.json();
      urls.push(data.secure_url);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const uploadedUrls = newImages.length > 0 ? await uploadNewImages() : [];
      const allImages = [...existingImages, ...uploadedUrls];

      const payload = {
        name: form.name.trim(),
        brand: form.brand,
        category: form.category,
        price: parseFloat(form.price),
        mrp: parseFloat(form.mrp),
        description: form.description.trim(),
        images: allImages,
        in_stock: form.in_stock,
        featured: form.featured,
        trending: form.trending,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSuccess(true);
      setTimeout(() => router.push("/sabs-controller/dashboard/products"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      setSaving(false);
    }
  };

  const discount = form.price && form.mrp
    ? Math.max(0, Math.floor(((parseFloat(form.mrp) - parseFloat(form.price)) / parseFloat(form.mrp)) * 100))
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sabs-controller/dashboard/products" className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
          <FiArrowLeft />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
          <p className="text-gray-500 text-sm truncate max-w-xs">{form.name}</p>
        </div>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-5 text-sm font-medium">✅ Updated! Redirecting...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-5 text-sm">✗ {error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">Product Images</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((url, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-brand-accent group">
                <Image src={url} alt="product" fill className="object-cover" />
                <button type="button" onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiX size={10} />
                </button>
                {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-brand-primary text-white text-[9px] text-center py-0.5 font-bold">Main</span>}
              </div>
            ))}
            {newImages.map((img, idx) => (
              <div key={`new-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-green-300 group">
                <Image src={img.preview} alt="new" fill className="object-cover" />
                <button type="button" onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiX size={10} />
                </button>
                <span className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[9px] text-center py-0.5 font-bold">New</span>
              </div>
            ))}
            {(existingImages.length + newImages.length) < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-primary flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-primary transition-colors">
                <FiUpload size={20} />
                <span className="text-[10px]">Add More</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleNewImages} />

          {/* AI Re-generate button */}
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={aiLoading}
            className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              aiLoading
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-brand-primary text-white hover:opacity-90"
            }`}
          >
            {aiLoading ? (
              <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              AI is regenerating with today&apos;s data...</>
            ) : (
              <><FiRefreshCw size={14} /> 🔄 Re-generate with AI (Update to Today&apos;s Data)</>
            )}
          </button>

          {/* AI Progress bar */}
          {aiLoading && aiProgress > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>AI analyzing...</span>
                <span>{aiProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${aiProgress}%`, background: "linear-gradient(90deg,#7c3aed,#C41E3A)" }} />
              </div>
            </div>
          )}
          {aiProgress === 100 && !aiLoading && (
            <p className="text-center text-xs text-green-600 font-semibold mt-2">✅ AI updated all fields with today&apos;s data!</p>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AddableSelect
                label="Brand"
                value={form.brand}
                onChange={(val) => setForm((p) => ({ ...p, brand: val }))}
                options={brands}
                onAddNew={(val) => setBrands((prev) => [...prev, val])}
                placeholder="Select Brand"
              />
              <AddableSelect
                label="Category"
                value={form.category}
                onChange={(val) => setForm((p) => ({ ...p, category: val }))}
                options={categories}
                onAddNew={(val) => setCategories((prev) => [...prev, val])}
                placeholder="Select Category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Tags (comma separated)</label>
              <input type="text" name="tags" value={form.tags} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Selling Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} min="1" step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">MRP (₹)</label>
              <input type="number" name="mrp" value={form.mrp} onChange={handleChange} min="1" step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Discount</label>
              <div className="border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50">
                <span className={`font-bold text-lg ${discount > 0 ? "text-green-600" : "text-gray-400"}`}>{discount}% OFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">Settings</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "in_stock", label: "In Stock", desc: "Available for purchase" },
              { name: "featured", label: "⭐ Featured", desc: "Homepage featured" },
              { name: "trending", label: "🔥 Trending", desc: "Trending section" },
            ].map((toggle) => (
              <label key={toggle.name} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" name={toggle.name}
                  checked={form[toggle.name as keyof typeof form] as boolean}
                  onChange={handleChange} className="mt-0.5 accent-brand-primary w-4 h-4" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{toggle.label}</p>
                  <p className="text-xs text-gray-400">{toggle.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <Link href="/sabs-controller/dashboard/products" className="flex-1 text-center border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={saving || success}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
            {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : <><FiSave /> Update Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
