"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiUpload, FiX, FiSave, FiArrowLeft, FiPlus, FiZap, FiCheck } from "react-icons/fi";
import Link from "next/link";

const DEFAULT_CATEGORIES = ["Cosmetics","Makeup","Skin Care","Hair Care","Body Care","Perfumes","Electronics","Purses & Bags","Wax & Accessories"];
const DEFAULT_BRANDS = ["Lakme","Maybelline","SUGAR","RENEE","Insight","6MARS","Swiss Beauty","Hilary Rhoda","Nykaa","Plum","Vega","Braun","Lotus","Biotique","WOW","Mamaearth"];

const STAGES = [
  { label: "Uploading image...", pct: 15 },
  { label: "AI analyzing product...", pct: 35 },
  { label: "Extracting product details...", pct: 55 },
  { label: "Generating SEO content...", pct: 75 },
  { label: "Optimizing for ranking...", pct: 90 },
  { label: "Saving to database...", pct: 98 },
];

function AddableSelect({ label, value, onChange, options, onAddNew, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; onAddNew: (v: string) => void; placeholder: string; required?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");
  const handleAdd = () => {
    const t = newVal.trim(); if (!t) return;
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
          <button type="button" onClick={handleAdd} className="px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold">Add</button>
          <button type="button" onClick={() => { setAdding(false); setNewVal(""); }} className="px-3 py-2.5 bg-gray-100 rounded-xl text-sm"><FiX /></button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select value={value} onChange={(e) => onChange(e.target.value)} required={required}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary bg-white">
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
  name: string; brand: string; category: string; price: number; mrp: number;
  description: string; tags: string[]; seo_title: string; seo_description: string;
  key_benefits: string[]; how_to_use: string; suitable_for: string;
  faq: { q: string; a: string }[];
  _imageUrl?: string;
  _seoImageName?: string;
}
interface FormData {
  name: string; brand: string; category: string; price: string; mrp: string;
  description: string; in_stock: boolean; featured: boolean; trending: boolean;
  tags: string; seo_title: string; seo_description: string;
  key_benefits: string; how_to_use: string; suitable_for: string;
}

function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch { /* ignore */ }
}

export default function AddProduct() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState(DEFAULT_BRANDS);
  const [images, setImages] = useState<{ file: File; preview: string; base64: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiFaq, setAiFaq] = useState<{ q: string; a: string }[]>([]);
  const [aiUploadedImageUrl, setAiUploadedImageUrl] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [saveProgress, setSaveProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [autoSaveMode, setAutoSaveMode]     = useState(true);  // default ON
  const [autoSaveCountdown, setAutoSaveCountdown] = useState<number | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState("");
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

  const cancelAutoSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setAutoSaveCountdown(null);
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res((r.result as string).split(",")[1]);
      r.onerror = rej; r.readAsDataURL(file);
    });

  // Resize image to max 800px and compress to reduce base64 size
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
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        URL.revokeObjectURL(url);
        resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = url;
    });

  // Upload directly from browser to Cloudinary using unsigned preset
  const uploadToCloudinaryDirect = async (file: File): Promise<string> => {
    const cloudName = "zjlchjal";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "shreeambika_products");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST", body: fd,
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url as string;
  };

  // Auto-trigger AI when first image is added
  const triggerAI = useCallback(async (imgList: { file: File; preview: string; base64: string }[]) => {
    if (imgList.length === 0) return;
    setError(""); setAiLoading(true); setAiDone(false); setProgress(0);

    let stageIdx = 0;
    const interval = setInterval(() => {
      if (stageIdx < 4) {
        setProgress(STAGES[stageIdx].pct);
        setProgressLabel(STAGES[stageIdx].label);
        stageIdx++;
      }
    }, 1800);

    try {
      // Step 1: Resize image in browser (max 800px, JPEG 75%) — no Cloudinary for AI
      setProgress(10); setProgressLabel("Preparing image...");
      const { base64, mimeType } = await resizeImage(imgList[0].file);

      // Step 2: Send resized base64 directly to Groq via API
      setProgress(45); setProgressLabel("AI analyzing product...");
      const res = await fetch("/api/admin/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      clearInterval(interval);
      setProgress(90); setProgressLabel("Filling in all details...");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI failed");
      const d: AIData = json.data;
      setForm((p) => ({
        ...p,
        name: d.name || p.name, brand: d.brand || p.brand, category: d.category || p.category,
        price: d.price ? String(d.price) : p.price, mrp: d.mrp ? String(d.mrp) : p.mrp,
        description: d.description || p.description,
        tags: Array.isArray(d.tags) ? d.tags.join(", ") : p.tags,
        seo_title: d.seo_title || p.seo_title, seo_description: d.seo_description || p.seo_description,
        key_benefits: Array.isArray(d.key_benefits) ? d.key_benefits.join("\n") : p.key_benefits,
        how_to_use: d.how_to_use || p.how_to_use, suitable_for: d.suitable_for || p.suitable_for,
      }));
      if (d.brand && !brands.includes(d.brand)) setBrands((b) => [...b, d.brand]);
      if (d.category && !categories.includes(d.category)) setCategories((c) => [...c, d.category]);
      setAiFaq(d.faq || []);
      // Store the already-uploaded Cloudinary URL so we don't re-upload
      if (d._imageUrl) {
        setAiUploadedImageUrl(d._imageUrl);
      }
      setProgress(100); setProgressLabel("✅ All details filled!");
      setAiDone(true);

      // Auto-save countdown if mode is ON
      if (autoSaveMode) {
        let secs = 5;
        setAutoSaveCountdown(secs);
        countdownInterval.current = setInterval(() => {
          secs -= 1;
          setAutoSaveCountdown(secs);
          if (secs <= 0) {
            clearInterval(countdownInterval.current!);
            setAutoSaveCountdown(null);
          }
        }, 1000);
        autoSaveTimer.current = setTimeout(() => {
          // Trigger form submit programmatically
          document.getElementById("product-form")?.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
          );
        }, 5000);
      }
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "AI generation failed");
      setProgress(0);
    } finally {
      setAiLoading(false);
    }
  }, [brands, categories]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const toAdd = files.slice(0, 5 - images.length);
    const newImgs = await Promise.all(toAdd.map(async (file) => ({
      file, preview: URL.createObjectURL(file), base64: await toBase64(file),
    })));
    const updated = [...images, ...newImgs];
    setImages(updated);
    if (images.length === 0 && newImgs.length > 0) triggerAI(updated);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(images[idx].preview);
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    if (updated.length === 0) { setAiDone(false); setProgress(0); setProgressLabel(""); }
  };

  const uploadImages = async () => {
    const urls: string[] = []; const ids: string[] = [];
    const cloudName = "zjlchjal";
    for (let i = 0; i < images.length; i++) {
      setSaveProgress(Math.round(10 + (i / images.length) * 40));
      
      // First image already uploaded during AI analysis — reuse URL
      if (i === 0 && aiUploadedImageUrl) {
        urls.push(aiUploadedImageUrl);
        // Extract public_id from URL
        const parts = aiUploadedImageUrl.split("/");
        const publicId = parts.slice(-2).join("/").replace(/\.[^/.]+$/, "");
        ids.push(publicId);
        continue;
      }

      const fd = new FormData();
      fd.append("file", images[i].file);
      fd.append("upload_preset", "shreeambika_products");
      // Use SEO-friendly name based on product name
      const seoName = form.name
        ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)
        : "beauty-product";
      fd.append("public_id", `shreeambika-products/${seoName}-${i}`);

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
      setSaveProgress(5);
      const { urls, ids } = await uploadImages();
      setSaveProgress(55);
      const payload = {
        name: form.name.trim(), brand: form.brand, category: form.category,
        price: parseFloat(form.price), mrp: parseFloat(form.mrp),
        description: form.description.trim(), images: urls, cloudinary_ids: ids,
        in_stock: form.in_stock, featured: form.featured, trending: form.trending,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        seo_title: form.seo_title, seo_description: form.seo_description,
        key_benefits: form.key_benefits ? form.key_benefits.split("\n").filter(Boolean) : [],
        how_to_use: form.how_to_use, suitable_for: form.suitable_for, faq: aiFaq,
      };
      setSaveProgress(75);
      const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSaveProgress(100);
      playSuccessSound();
      setShowSuccess(true);
      setTimeout(() => router.push("/sabs-controller/dashboard/products"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaveProgress(0);
    }
  };

  const discount = form.price && form.mrp
    ? Math.max(0, Math.floor(((parseFloat(form.mrp) - parseFloat(form.price)) / parseFloat(form.mrp)) * 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiCheck size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Saved!</h2>
            <p className="text-gray-500 text-sm mb-6">Your product has been successfully added to the store.</p>
            {/* Animated progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-300 animate-pulse" style={{ width: "100%" }} />
            </div>
            <p className="text-xs text-gray-400 mt-3">Redirecting to products list...</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/sabs-controller/dashboard/products" className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><FiArrowLeft /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-500 text-sm">Upload product image → AI fills everything automatically</p>
        </div>
        {/* Auto-save toggle */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <span className="text-xs font-semibold text-gray-600">Auto Save</span>
          <button type="button" onClick={() => { setAutoSaveMode((v) => !v); cancelAutoSave(); }}
            className={`relative w-10 h-5 rounded-full transition-all duration-300 ${autoSaveMode ? "bg-green-500" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${autoSaveMode ? "left-5" : "left-0.5"}`} />
          </button>
          <span className={`text-[10px] font-bold ${autoSaveMode ? "text-green-600" : "text-gray-400"}`}>
            {autoSaveMode ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-5 text-sm">✗ {error}</div>}

      <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
        {/* IMAGES */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-1">Product Images <span className="text-red-500">*</span></h2>
          <p className="text-xs text-gray-400 mb-4">
            {images.length === 0 ? "Upload image — AI will auto-fill all fields instantly" : aiLoading ? "🤖 AI is working..." : aiDone ? "✅ AI filled all details! Review & save." : ""}
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-brand-accent group shadow-sm">
                <Image src={img.preview} alt="preview" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <FiX size={11} />
                </button>
                {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-brand-primary text-white text-[9px] text-center py-1 font-bold">MAIN</span>}
              </div>
            ))}
            {images.length < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 hover:border-brand-primary flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-brand-primary transition-all hover:bg-brand-light">
                <FiUpload size={22} />
                <span className="text-xs font-medium">Add Image</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

          {/* AI PROGRESS BAR */}
          {(aiLoading || aiDone) && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <FiZap size={14} className={aiLoading ? "text-purple-500 animate-pulse" : "text-green-500"} />
                  <span className="text-xs font-semibold text-gray-600">{progressLabel}</span>
                </div>
                <span className="text-xs font-bold text-brand-primary">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: progress === 100
                      ? "linear-gradient(90deg,#22c55e,#16a34a)"
                      : "linear-gradient(90deg,#7c3aed,#C41E3A,#FFB6C1)",
                  }}
                />
              </div>
              {aiLoading && (
                <div className="flex gap-1 mt-2">
                  {STAGES.map((s, i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-500 ${progress >= s.pct ? "bg-brand-primary" : "bg-gray-200"}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Re-analyze button */}
          {images.length > 0 && !aiLoading && (
            <button type="button" onClick={() => triggerAI(images)}
              className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                aiDone ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gradient-to-r from-purple-600 to-brand-primary text-white hover:opacity-90"
              }`}>
              <FiZap size={14} />
              {aiDone ? "Re-analyze with AI" : "Generate with AI"}
            </button>
          )}
        </div>

        {/* BASIC INFO */}
        <div className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-500 ${aiDone ? "border-green-200 shadow-green-50" : "border-gray-100"}`}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-gray-700">Basic Information</h2>
            {aiDone && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><FiZap size={10} /> AI Filled</span>}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                placeholder={aiLoading ? "AI is generating..." : "Product name will appear here after AI analysis"}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${aiDone && form.name ? "border-green-300 bg-green-50/30" : "border-gray-200 focus:border-brand-primary"}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AddableSelect label="Brand" value={form.brand} onChange={(v) => setForm((p) => ({ ...p, brand: v }))}
                options={brands} onAddNew={(v) => setBrands((b) => [...b, v])} placeholder="AI will select..." required />
              <AddableSelect label="Category" value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))}
                options={categories} onAddNew={(v) => setCategories((c) => [...c, v])} placeholder="AI will select..." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                placeholder={aiLoading ? "AI is generating SEO description..." : "AI-generated SEO description will appear here"}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors ${aiDone && form.description ? "border-green-300 bg-green-50/30" : "border-gray-200 focus:border-brand-primary"}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Suitable For</label>
                <input type="text" name="suitable_for" value={form.suitable_for} onChange={handleChange}
                  placeholder="e.g. All skin types..."
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
                placeholder="AI will list benefits..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">How to Use</label>
              <textarea name="how_to_use" value={form.how_to_use} onChange={handleChange} rows={2}
                placeholder="AI will write usage steps..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary resize-none" />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-500 ${aiDone ? "border-blue-200" : "border-gray-100"}`}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-gray-700">SEO / AEO / GEO Details</h2>
            {aiDone && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><FiZap size={10} /> AI Optimized</span>}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">SEO Title <span className="text-xs text-gray-400">(max 60 chars)</span></label>
              <input type="text" name="seo_title" value={form.seo_title} onChange={handleChange} maxLength={70}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
              <p className={`text-xs mt-1 ${form.seo_title.length > 60 ? "text-red-500" : "text-gray-400"}`}>{form.seo_title.length}/60</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Meta Description <span className="text-xs text-gray-400">(max 155 chars)</span></label>
              <textarea name="seo_description" value={form.seo_description} onChange={handleChange} maxLength={165} rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary resize-none" />
              <p className={`text-xs mt-1 ${form.seo_description.length > 155 ? "text-red-500" : "text-gray-400"}`}>{form.seo_description.length}/155</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        {aiFaq.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-bold text-gray-700">FAQ — AEO / LLM Optimization</h2>
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-semibold">✨ AI Generated</span>
            </div>
            <div className="space-y-3">
              {aiFaq.map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm font-semibold text-brand-primary mb-1">Q: {f.q}</p>
                  <p className="text-sm text-gray-600">A: {f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRICING */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-gray-700">Pricing</h2>
            {aiDone && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">💡 AI Suggested — Verify & Edit</span>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Selling Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0" min="1" step="0.01" required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">MRP (₹) <span className="text-red-500">*</span></label>
              <input type="number" name="mrp" value={form.mrp} onChange={handleChange} placeholder="0" min="1" step="0.01" required
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
                <input type="checkbox" name={t.name} checked={form[t.name as keyof FormData] as boolean}
                  onChange={handleChange} className="mt-0.5 accent-brand-primary w-4 h-4" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Stock Count</label>
            <input type="number" name="stock_count" min="0"
              value={(form as FormData & { stock_count?: string }).stock_count || ""}
              onChange={handleChange}
              placeholder="How many units available?"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
          </div>
        </div>

        {/* AUTO-SAVE COUNTDOWN BANNER */}
        {autoSaveCountdown !== null && (
          <div className="bg-green-50 border border-green-300 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-lg">
                {autoSaveCountdown}
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">Auto-saving in {autoSaveCountdown} seconds...</p>
                <p className="text-xs text-green-600">AI has filled all details. Saving automatically.</p>
              </div>
            </div>
            <button type="button" onClick={cancelAutoSave}
              className="px-4 py-2 bg-white border border-green-300 text-green-700 font-bold rounded-xl text-sm hover:bg-green-50 transition-colors">
              ✕ Cancel
            </button>
          </div>
        )}

        {/* SAVE PROGRESS BAR */}
        {saveProgress > 0 && saveProgress < 100 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-accent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                {saveProgress < 50 ? "📤 Uploading images to Cloudinary..." : saveProgress < 80 ? "💾 Saving product to database..." : "✅ Almost done..."}
              </span>
              <span className="text-sm font-bold text-brand-primary">{saveProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${saveProgress}%`, background: "linear-gradient(90deg,#8B0000,#C41E3A)" }} />
            </div>
          </div>
        )}

        {/* SUBMIT */}
        <div className="flex gap-3 pb-6">
          <Link href="/sabs-controller/dashboard/products"
            className="flex-1 text-center border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={saveProgress > 0 && saveProgress < 100}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {saveProgress > 0 && saveProgress < 100
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing... {saveProgress}%</>
              : <><FiSave /> Save Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
