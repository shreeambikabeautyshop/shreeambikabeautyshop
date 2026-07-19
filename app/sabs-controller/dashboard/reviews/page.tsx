"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FiPlus, FiTrash2, FiEye, FiEyeOff, FiUpload, FiX, FiSave, FiStar, FiZap } from "react-icons/fi";

interface Review {
  id: string;
  reviewer_name: string;
  location?: string;
  review_text?: string;
  images: string[];
  cloudinary_ids: string[];
  order_type?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const ORDER_TYPES = ["Single Item", "Bulk Order", "Repeat Order", "Gift Order", "Pan India", "International"];

const CONFIDENCE_COLOR: Record<string, string> = {
  high:   "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-gray-100 text-gray-500",
};

export default function ReviewsAdmin() {
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiDone, setAiDone]         = useState(false);
  const [aiConfidence, setAiConf]   = useState<string>("");
  const [error, setError]           = useState("");
  const fileRef                     = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    reviewer_name: "",
    location: "",
    review_text: "",
    order_type: "",
    is_active: true,
    sort_order: 0,
  });
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const { data } = await res.json();
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  // ── Resize image for AI (max 800px, JPEG 75%)
  const resizeForAI = (file: File): Promise<{ base64: string; mimeType: string }> =>
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

  // ── Auto-analyze first image with Groq AI
  const analyzeWithAI = async (file: File) => {
    setAiLoading(true);
    setAiDone(false);
    setError("");
    try {
      const { base64, mimeType } = await resizeForAI(file);
      const res = await fetch("/api/admin/analyze-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "AI failed");
      const d = json.data;
      setForm((prev) => ({
        ...prev,
        reviewer_name: d.reviewer_name || prev.reviewer_name,
        location:      d.location      || prev.location,
        review_text:   d.review_text   || prev.review_text,
        order_type:    d.order_type    || prev.order_type,
      }));
      setAiConf(d.confidence || "medium");
      setAiDone(true);
    } catch (err) {
      setError("AI analysis failed — fill manually: " + (err instanceof Error ? err.message : ""));
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const toAdd = files.slice(0, 5 - images.length);
    const newImgs = toAdd.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    const updated = [...images, ...newImgs];
    setImages(updated);
    // Auto-analyze the first image uploaded
    if (images.length === 0 && newImgs.length > 0) {
      await analyzeWithAI(newImgs[0].file);
    }
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(images[idx].preview);
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (idx === 0) { setAiDone(false); setAiConf(""); }
  };

  const uploadImages = async (): Promise<{ urls: string[]; ids: string[] }> => {
    const urls: string[] = [];
    const ids: string[] = [];
    for (const img of images) {
      const fd = new FormData();
      fd.append("file", img.file);
      fd.append("upload_preset", "shreeambika_products");
      fd.append("public_id", `shreeambika-reviews/review-${Date.now()}-${Math.random().toString(36).slice(2,6)}`);
      const res = await fetch("https://api.cloudinary.com/v1_1/zjlchjal/image/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || "Upload failed");
      urls.push(data.secure_url);
      ids.push(data.public_id);
    }
    return { urls, ids };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.reviewer_name.trim()) { setError("Customer name is required"); return; }
    if (images.length === 0) { setError("Please add at least one review image"); return; }
    try {
      setSaving(true);
      const { urls, ids } = await uploadImages();
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images: urls, cloudinary_ids: ids }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setReviews((prev) => [json.data, ...prev]);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setForm({ reviewer_name: "", location: "", review_text: "", order_type: "", is_active: true, sort_order: 0 });
    setImages([]);
    setAiDone(false);
    setAiConf("");
    setError("");
  };

  const toggleActive = async (review: Review) => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id, is_active: !review.is_active }),
    });
    if (res.ok) setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, is_active: !r.is_active } : r));
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiStar className="text-brand-primary" /> Customer Reviews
          </h1>
          <p className="text-gray-500 text-sm mt-1">Upload image → AI auto-fills everything → Edit if needed → Save</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(""); }}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
          <FiPlus /> Add Review
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Reviews",   val: reviews.length,                          color: "text-gray-800" },
          { label: "Live on Website", val: reviews.filter((r) => r.is_active).length,  color: "text-green-600" },
          { label: "Hidden",          val: reviews.filter((r) => !r.is_active).length, color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── ADD FORM MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Add Customer Review</h2>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <FiZap size={11} className="text-purple-500" />
                  Upload image — AI detects name, location &amp; review automatically
                </p>
              </div>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── IMAGE UPLOAD + AI ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Images <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-400 ml-1">(WhatsApp chats, order proofs, selfies with products)</span>
                </label>

                <div className="flex flex-wrap gap-3 mb-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-brand-accent group">
                      <Image src={img.preview} alt="review" fill className="object-cover" />
                      <button type="button" onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiX size={10} />
                      </button>
                      {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-brand-primary/80 text-white text-[9px] text-center py-0.5 font-bold">MAIN</span>}
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-primary flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-brand-primary transition-all hover:bg-brand-light">
                      <FiUpload size={20} />
                      <span className="text-xs font-medium">Upload</span>
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

                {/* AI Status bar */}
                {(aiLoading || aiDone) && (
                  <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${aiDone ? "bg-green-50 border border-green-200" : "bg-purple-50 border border-purple-200"}`}>
                    {aiLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-purple-700">🤖 AI is reading your image...</p>
                          <p className="text-[11px] text-purple-500">Detecting customer name, location, review text</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">✅</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-green-700">AI filled the details below!</p>
                          <p className="text-[11px] text-green-600">Review & edit if needed, then save.</p>
                        </div>
                        {aiConfidence && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CONFIDENCE_COLOR[aiConfidence] || "bg-gray-100 text-gray-500"}`}>
                            {aiConfidence === "high" ? "✓ High confidence" : aiConfidence === "medium" ? "~ Medium confidence" : "Low confidence"}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Re-analyze button */}
                {images.length > 0 && !aiLoading && (
                  <button type="button" onClick={() => analyzeWithAI(images[0].file)}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors">
                    <FiZap size={12} /> Re-analyze with AI
                  </button>
                )}
              </div>

              {/* ── FORM FIELDS ── */}
              <div className={`space-y-4 transition-all duration-300 ${aiDone ? "opacity-100" : "opacity-70"}`}>

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Customer Name <span className="text-red-500">*</span>
                    {aiDone && form.reviewer_name && <span className="ml-2 text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">AI detected</span>}
                  </label>
                  <input type="text" value={form.reviewer_name}
                    onChange={(e) => setForm((p) => ({ ...p, reviewer_name: e.target.value }))}
                    placeholder="e.g. Priya Sharma" required
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${aiDone && form.reviewer_name ? "border-green-300 bg-green-50/30 focus:border-green-400" : "border-gray-200 focus:border-brand-primary"}`} />
                </div>

                {/* Location + Order Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Location
                      {aiDone && form.location && <span className="ml-1 text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">AI</span>}
                    </label>
                    <input type="text" value={form.location}
                      onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Mumbai, Dubai"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${aiDone && form.location ? "border-green-300 bg-green-50/30" : "border-gray-200 focus:border-brand-primary"}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Order Type
                      {aiDone && form.order_type && <span className="ml-1 text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">AI</span>}
                    </label>
                    <select value={form.order_type}
                      onChange={(e) => setForm((p) => ({ ...p, order_type: e.target.value }))}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none bg-white transition-colors ${aiDone && form.order_type ? "border-green-300 bg-green-50/30" : "border-gray-200 focus:border-brand-primary"}`}>
                      <option value="">Select...</option>
                      {ORDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Review Caption */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Caption / Review Text
                    {aiDone && form.review_text && <span className="ml-2 text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">AI detected</span>}
                  </label>
                  <textarea value={form.review_text}
                    onChange={(e) => setForm((p) => ({ ...p, review_text: e.target.value }))}
                    rows={3} placeholder="Got my order same day! Amazing quality..."
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors ${aiDone && form.review_text ? "border-green-300 bg-green-50/30" : "border-gray-200 focus:border-brand-primary"}`} />
                </div>

                {/* Display Priority + Active */}
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Priority</label>
                    <input type="number" value={form.sort_order} min={0} max={100}
                      onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={form.is_active}
                      onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-brand-primary" />
                    <span className="text-sm font-medium text-gray-700">Show on website</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving || aiLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm">
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><FiSave /> Save Review</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REVIEWS GRID ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
          <p className="text-4xl mb-3">⭐</p>
          <h3 className="text-lg font-bold text-gray-600 mb-1">No reviews yet</h3>
          <p className="text-gray-400 text-sm mb-5">Upload a WhatsApp screenshot — AI will fill everything automatically</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold px-6 py-2.5 rounded-full text-sm">
            <FiPlus /> Add First Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reviews.map((review) => (
            <div key={review.id}
              className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition-all ${review.is_active ? "border-gray-100" : "border-gray-200 opacity-60"}`}>
              <div className="relative aspect-square bg-gray-50">
                {review.images?.[0] ? (
                  <Image src={review.images[0]} alt={review.reviewer_name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">⭐</div>
                )}
                {review.images?.length > 1 && (
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    +{review.images.length - 1}
                  </span>
                )}
                {!review.is_active && (
                  <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                    <span className="bg-white text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Hidden</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-gray-800 truncate">{review.reviewer_name}</p>
                {review.location && <p className="text-xs text-gray-400">📍 {review.location}</p>}
                {review.order_type && (
                  <span className="inline-block mt-1 text-[10px] bg-brand-light text-brand-primary font-semibold px-2 py-0.5 rounded-full">
                    {review.order_type}
                  </span>
                )}
                {review.review_text && (
                  <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">{review.review_text}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => toggleActive(review)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${review.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {review.is_active ? <><FiEye size={11} /> Live</> : <><FiEyeOff size={11} /> Hidden</>}
                  </button>
                  <button onClick={() => deleteReview(review.id)}
                    className="flex items-center justify-center p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
