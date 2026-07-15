"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiUpload, FiX, FiSave, FiArrowLeft, FiPlus, FiZap } from "react-icons/fi";
import Link from "next/link";

const DEFAULT_CATEGORIES = [
  "Cosmetics","Makeup","Skin Care","Hair Care",
  "Body Care","Perfumes","Electronics","Purses & Bags","Wax & Accessories",
];
const DEFAULT_BRANDS = [
  "Lakme","Maybelline","SUGAR","RENEE","Insight","6MARS",
  "Swiss Beauty","Hilary Rhoda","Nykaa","Plum","Vega","Braun",
  "Lotus","Biotique","WOW","Mamaearth",
];

function AddableSelect({ label, value, onChange, options, onAddNew, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; onAddNew: (v: string) => void;
  placeholder: string; required?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");
  const handleAdd = () => {
    const t = newVal.trim();
    if (!t) return;
    onAddNew(t); onChange(t); setNewVal(""); setAdding(false);
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
            placeholder={`New ${label.toLowerCase()}...`} autoFocus
            className="flex-1 border border-brand-primary rounded-xl px-4 py-2.5 text-sm outline-none" />
          <button type="button" onClick={handleAdd}
            className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold">Add</button>
          <button type="button" onClick={() => { setAdding(false); setNewVal(""); }}
            className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm"><FiX /></button>
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
            className="flex items-center gap-1 px-3 py-2.5 bg-brand-light hover:bg-pink-100 text-brand-primary border border-brand-accent rounded-xl text-xs font-semibold">
            <FiPlus size={13} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

interface AIData {
  name: string; brand: string; category: string;
  price: number; mrp: number; description: string;
  tags: string[]; seo_title: string; seo_description: string;
  key_benefits: string[]; how_to_use: string; suitable_for: string;
  faq: { q: string; a: string }[];
}

interface FormData {
  name: string; brand: string; category: string;
  price: string; mrp: string; description: string;
  in_stock: boolean; featured: boolean; trending: boolean;
  tags: string; seo_title: string; seo_description: string;
  key_benefits: string; how_to_use: string; suitable_for: string;
}

export default function AddProduct() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [images, setImages] = useState<{ file: File; preview: string; base64: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiFaq, setAiFaq] = useState<{ q: string; a: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "", brand: "", category: "", price: "", mrp: "",
    description: "", in_stock: true, featured: false, trending: false,
    tags: "", seo_title: "", seo_description: "",
    key_benefits: "", how_to_use: "", suitable_for: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res((reader.result as string).split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const toAdd = files.slice(0, 5 - images.length);
    const newImgs = await Promise.all(
      toAdd.map(async (file) => ({
        file,
        preview: URL.createObjectURL(file),
        base64: await toBase64(file),
      }))
    );
    setImages((prev) => [...prev, ...newImgs]);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(images[idx].preview);
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (images.length === 1) setAiDone(false);
  };

  const handleAIGenerate = async () => {
    if (images.length === 0) { setError("Please upload at least one image first."); return; }
    setError(""); setAiLoading(true);
    try {
      const res = await fetch("/api/admin/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: images[0].base64,
          mimeType: images[0].file.type,
          brand: form.brand || "",
          category: form.category || "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI generation failed");
      const d: AIData = json.data;
      setForm((p) => ({
        ...p,
        name: d.name || p.name,
        brand: d.brand || p.brand,
        category: d.category || p.category,
        price: d.price ? String(d.price) : p.price,
        mrp: d.mrp ? String(d.mrp) : p.mrp,
        description: d.description || p.description,
        tags: Array.isArray(d.tags) ? d.tags.join(", ") : p.tags,
        seo_title: d.seo_title || p.seo_title,
        seo_description: d.seo_description || p.seo_description,
        key_benefits: Array.isArray(d.key_benefits) ? d.key_benefits.join("\n") : p.key_benefits,
        how_to_use: d.how_to_use || p.how_to_use,
        suitable_for: d.suitable_for || p.suitable_for,
      }));
      if (d.brand && !brands.includes(d.brand)) setBrands((b) => [...b, d.brand]);
      if (d.category && !categories.includes(d.category)) setCategories((c) => [...c, d.category]);
      setAiFaq(d.faq || []);
      setAiDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const uploadImages = async () => {
    const urls: string[] = []; const ids: string[] = [];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "zjlchjal";
    for (const img of images) {
      const fd = new FormData();
      fd.append("file", img.file); fd.append("upload_preset", "shreeambika_products"); fd.append("folder", "shreeambika-products");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Image upload failed");
      const d = await res.json(); urls.push(d.secure_url); ids.push(d.public_id);
    }
    return { urls, ids };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.name || !form.brand || !form.category || !form.price || !form.mrp) { setError("Please fill all required fields."); return; }
    if (images.length === 0) { setError("Please add at least one product image."); return; }
    try {
      setUploading(true);
      const { urls, ids } = await uploadImages();
      setUploading(false); setSaving(true);
      const payload = {
        name: form.name.trim(), brand: form.brand, category: form.category,
        price: parseFloat(form.price), mrp: parseFloat(form.mrp),
        description: form.description.trim(),
        images: urls, cloudinary_ids: ids,
        in_stock: form.in_stock, featured: form.featured, trending: form.trending,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        seo_title: form.seo_title.trim(), seo_description: form.seo_description.trim(),
        key_benefits: form.key_benefits ? form.key_benefits.split("\n").filter(Boolean) : [],
        how_to_use: form.how_to_use.trim(), suitable_for: form.suitable_for.trim(),
        faq: aiFaq,
      };
      const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");
      setSuccess(true);
      setTimeout(() => router.push("/sabs-controller/dashboard/products"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setUploading(false); setSaving(false);
    }
  };

  const discount = form.price && form.mrp
    ? Math.max(0, Math.floor(((parseFloat(form.mrp) - parseFloat(form.price)) / parseFloat(form.mrp)) * 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sabs-controller/dashboard/products" className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><FiArrowLeft /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-500 text-sm">Upload image → AI generates all details automatically</p>
        </div>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-5 text-sm font-medium">✅ Product added! Redirecting...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-5 text-sm">✗ {error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* IMAGES + AI BUTTON */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-1">Product Images <span className="text-red-500">*</span></h2>
          <p className="text-xs text-gray-400 mb-4">Upload image first, then click &quot;Generate with AI&quot; to auto-fill all details</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-brand-accent group">
                <Image src={img.preview} alt="preview" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><FiX size={10} /></button>
                {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-brand-primary text-white text-[9px] text-center py-0.5 font-bold">Main</span>}
              </div>
            ))}
            {images.length < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-primary flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-primary transition-colors">
                <FiUpload size={20} /><span className="text-[10px]">Add Image</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

          {/* AI GENERATE BUTTON */}
          {images.length > 0 && (
            <button type="button" onClick={handleAIGenerate} disabled={aiLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                aiDone
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-r from-purple-600 to-brand-primary text-white hover:opacity-90"
              } disabled:opacity-60`}>
              {aiLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI is analyzing your product image...</>
              ) : aiDone ? (
                <>✅ AI Details Generated — Edit below if needed</>
              ) : (
                <><FiZap size={16} /> Generate All Details with AI (Gemini)</>
              )}
            </button>
          )}
        </div>

        {/* BASIC INFO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-gray-700">Basic Information</h2>
            {aiDone && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-semibold">✨ AI Filled</span>}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="AI will fill this automatically..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AddableSelect label="Brand" value={form.brand} onChange={(v) => setForm((p) => ({ ...p, brand: v }))}
                options={brands} onAddNew={(v) => setBrands((b) => [...b, v])} placeholder="Select Brand" required />
              <AddableSelect label="Category" value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))}
                options={categories} onAddNew={(v) => setCategories((c) => [...c, v])} placeholder="Select Category" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                placeholder="AI will generate SEO-rich description..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Suitable For</label>
                <input type="text" name="suitable_for" value={form.suitable_for} onChange={handleChange}
                  placeholder="e.g. All skin types, Dry skin..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Tags (comma separated)</label>
                <input type="text" name="tags" value={form.tags} onChange={handleChange}
                  placeholder="AI will generate tags..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Key Benefits (one per line)</label>
              <textarea name="key_benefits" value={form.key_benefits} onChange={handleChange} rows={3}
                placeholder="Long-lasting color&#10;Moisturizing formula&#10;No harmful chemicals"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">How to Use</label>
              <textarea name="how_to_use" value={form.how_to_use} onChange={handleChange} rows={2}
                placeholder="Step by step usage..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary resize-none" />
            </div>
          </div>
        </div>

        {/* SEO SECTION */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-gray-700">SEO / AEO / GEO Details</h2>
            {aiDone && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">✨ AI Filled</span>}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                SEO Title <span className="text-xs text-gray-400">(max 60 chars)</span>
              </label>
              <input type="text" name="seo_title" value={form.seo_title} onChange={handleChange}
                maxLength={70} placeholder="AI will generate optimized title..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
              <p className="text-xs text-gray-400 mt-1">{form.seo_title.length}/60 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Meta Description <span className="text-xs text-gray-400">(max 155 chars)</span>
              </label>
              <textarea name="seo_description" value={form.seo_description} onChange={handleChange}
                maxLength={165} rows={2} placeholder="AI will generate meta description..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary resize-none" />
              <p className="text-xs text-gray-400 mt-1">{form.seo_description.length}/155 characters</p>
            </div>
          </div>
        </div>

        {/* FAQ — from AI */}
        {aiFaq.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-bold text-gray-700">FAQ (for AEO / LLM Optimization)</h2>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">✨ AI Generated</span>
            </div>
            <div className="space-y-3">
              {aiFaq.map((faq, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm font-semibold text-brand-primary mb-1">Q: {faq.q}</p>
                  <p className="text-sm text-gray-600">A: {faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRICING */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-gray-700">Pricing</h2>
            {aiDone && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">✨ AI Suggested — Verify!</span>}
          </div>
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
                <span className={`font-bold text-lg ${discount > 0 ? "text-green-600" : "text-gray-400"}`}>{discount}% OFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* SETTINGS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">Product Settings</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "in_stock", label: "In Stock", desc: "Available for purchase" },
              { name: "featured", label: "⭐ Featured", desc: "Show on homepage" },
              { name: "trending", label: "🔥 Trending", desc: "Trending section" },
            ].map((t) => (
              <label key={t.name} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" name={t.name}
                  checked={form[t.name as keyof FormData] as boolean}
                  onChange={handleChange} className="mt-0.5 accent-brand-primary w-4 h-4" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex gap-3 pb-6">
          <Link href="/sabs-controller/dashboard/products"
            className="flex-1 text-center border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={uploading || saving || success}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
            {uploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading...</>
              : saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><FiSave /> Save Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
