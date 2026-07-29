"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  FiImage, FiUpload, FiRefreshCw, FiRotateCcw, FiTrash2,
  FiCheck, FiClock, FiEdit3, FiEye, FiAlertCircle,
} from "react-icons/fi";

// ── Default slides (fallback if DB is empty) ──────────────────────────────────
const DEFAULT_SLIDES = [
  { image: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png", alt: "Everything Your Beauty Needs Under One Place - Shree Ambika Beauty Shop" },
  { image: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-2_rtcjzp.png", alt: "Discount is Your Right - Shree Ambika Beauty Shop" },
  { image: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-3_gqqquq.png", alt: "We Are Everywhere To Serve You - Shree Ambika Beauty Shop" },
];

interface Slide { image: string; alt: string; }
interface HistoryRecord { id: string; slide_index: number; image_url: string; alt: string; changed_at: string; }

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function HeroSliderAdminPage() {
  const [slides,      setSlides]      = useState<Slide[]>(DEFAULT_SLIDES);
  const [history,     setHistory]     = useState<HistoryRecord[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState<number | null>(null);
  const [saving,      setSaving]      = useState<number | null>(null);
  const [saved,       setSaved]       = useState<number | null>(null);
  const [restoring,   setRestoring]   = useState<string | null>(null);
  const [editAlt,     setEditAlt]     = useState<number | null>(null);
  const [altDraft,    setAltDraft]    = useState("");
  const [previewIdx,  setPreviewIdx]  = useState<number | null>(null);
  const [historyTab,  setHistoryTab]  = useState<number>(0);
  const [toast,       setToast]       = useState("");
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      // Auto-run migration (creates slider_history table if not exists)
      await fetch("/api/admin/migrate-slider", { method: "POST" }).catch(() => {});

      const res = await fetch("/api/admin/hero-slider");
      const { current, history: hist } = await res.json();

      // Parse current slides from DB
      const parsed = [...DEFAULT_SLIDES];
      (current || []).forEach((row: { key: string; value: string }) => {
        const idx = parseInt(row.key.replace("slider_slide_", ""));
        if (!isNaN(idx) && idx >= 0 && idx < 3) {
          try { parsed[idx] = JSON.parse(row.value); } catch { /* keep default */ }
        }
      });
      setSlides(parsed);
      setHistory(hist || []);
    } catch { /* keep defaults */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Upload image to Cloudinary ─────────────────────────────────────────────
  const uploadToCloudinary = async (file: File, slideIndex: number): Promise<string | null> => {
    setUploading(slideIndex);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signRes = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp }),
      });
      const { signature, apiKey, cloudName } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", String(timestamp));
      formData.append("api_key", apiKey);
      formData.append("signature", signature);
      formData.append("folder", "hero-slider");

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await uploadRes.json();
      return data.secure_url || null;
    } catch { return null; }
    finally { setUploading(null); }
  };

  // ── Handle file pick → upload → save ──────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slideIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("❌ File too large. Max 5MB."); return; }

    const url = await uploadToCloudinary(file, slideIndex);
    if (!url) { showToast("❌ Upload failed. Try again."); return; }

    await saveSlide(slideIndex, url, slides[slideIndex].alt);
    e.target.value = "";
  };

  // ── Save slide to DB ───────────────────────────────────────────────────────
  const saveSlide = async (slideIndex: number, imageUrl: string, alt: string) => {
    setSaving(slideIndex);
    try {
      const res = await fetch("/api/admin/hero-slider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideIndex, imageUrl, alt }),
      });
      if (!res.ok) throw new Error();

      // Update local state
      setSlides(prev => {
        const next = [...prev];
        next[slideIndex] = { image: imageUrl, alt };
        return next;
      });
      setSaved(slideIndex);
      setTimeout(() => setSaved(null), 2000);
      showToast(`✅ Slide ${slideIndex + 1} updated!`);
      load(); // Refresh history
    } catch { showToast("❌ Failed to save. Try again."); }
    finally { setSaving(null); }
  };

  // ── Save alt text only ─────────────────────────────────────────────────────
  const saveAlt = async (slideIndex: number) => {
    await saveSlide(slideIndex, slides[slideIndex].image, altDraft);
    setEditAlt(null);
  };

  // ── Restore from history ───────────────────────────────────────────────────
  const restore = async (record: HistoryRecord) => {
    if (!confirm(`Restore this image to Slide ${record.slide_index + 1}?\n\nCurrent image will be moved to history.`)) return;
    setRestoring(record.id);
    try {
      const res = await fetch("/api/admin/hero-slider", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId: record.id, slideIndex: record.slide_index }),
      });
      if (!res.ok) throw new Error();
      showToast(`✅ Slide ${record.slide_index + 1} restored!`);
      load();
    } catch { showToast("❌ Restore failed."); }
    finally { setRestoring(null); }
  };

  // ── Delete history record ──────────────────────────────────────────────────
  const deleteHistory = async (id: string) => {
    if (!confirm("Delete this history record permanently?")) return;
    await fetch("/api/admin/hero-slider", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ historyId: id }),
    });
    setHistory(prev => prev.filter(h => h.id !== id));
    showToast("🗑 History record deleted.");
  };

  const historyForTab = history.filter(h => h.slide_index === historyTab);

  return (
    <div className="max-w-5xl">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FiImage size={22} className="text-brand-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hero Slider Manager</h1>
            <p className="text-gray-500 text-sm mt-0.5">Change homepage banner images · Full history · Restore anytime</p>
          </div>
        </div>
        <button onClick={load} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors" title="Refresh">
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-7 flex items-start gap-3">
        <FiAlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-800 text-sm">How it works</p>
          <p className="text-blue-700 text-xs mt-0.5">
            Upload a new image for any slide → it goes live on the website immediately. Old image is automatically saved to history so you can restore it anytime.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── SLIDE CARDS ── */}
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {slides.map((slide, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">

                {/* Slide number badge */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <span className="bg-brand-primary text-white text-xs font-black px-3 py-1 rounded-full">
                    Slide {idx + 1}
                  </span>
                  {saved === idx && (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                      <FiCheck size={12} /> Saved
                    </span>
                  )}
                </div>

                {/* Image preview */}
                <div
                  className="relative mx-4 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group"
                  style={{ aspectRatio: "16/6" }}
                  onClick={() => setPreviewIdx(idx)}
                  title="Click to preview fullscreen"
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt || `Slide ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <FiEye size={24} className="text-white" />
                  </div>
                  {(uploading === idx || saving === idx) && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-white text-xs font-bold">
                        {uploading === idx ? "Uploading..." : "Saving..."}
                      </span>
                    </div>
                  )}
                </div>

                {/* Alt text */}
                <div className="px-4 py-3 flex-1">
                  {editAlt === idx ? (
                    <div className="flex gap-2">
                      <input
                        value={altDraft}
                        onChange={e => setAltDraft(e.target.value)}
                        className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-primary"
                        placeholder="Image description..."
                        autoFocus
                      />
                      <button onClick={() => saveAlt(idx)}
                        className="bg-brand-primary text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                        Save
                      </button>
                      <button onClick={() => setEditAlt(null)}
                        className="text-gray-400 text-xs px-2 py-1.5 rounded-lg hover:bg-gray-100">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5 group/alt cursor-pointer" onClick={() => { setEditAlt(idx); setAltDraft(slide.alt); }}>
                      <p className="text-xs text-gray-500 flex-1 line-clamp-2">{slide.alt || "No description"}</p>
                      <FiEdit3 size={11} className="text-gray-300 group-hover/alt:text-brand-primary flex-shrink-0 mt-0.5 transition-colors" />
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <div className="px-4 pb-4">
                  <input
                    ref={fileRefs[idx]}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={e => handleFileChange(e, idx)}
                  />
                  <button
                    onClick={() => fileRefs[idx].current?.click()}
                    disabled={uploading === idx || saving === idx}
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    <FiUpload size={14} />
                    {uploading === idx ? "Uploading..." : saving === idx ? "Saving..." : "Change Image"}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-1.5">JPG / PNG / WebP · Max 5MB · 1920×680px recommended</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── HISTORY SECTION ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <FiClock size={18} className="text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800 flex-1">Image History</h2>
              <p className="text-xs text-gray-400">Old images are saved here automatically — restore anytime</p>
            </div>

            {/* Slide tabs */}
            <div className="flex gap-2 mb-5">
              {[0, 1, 2].map(i => (
                <button key={i}
                  onClick={() => setHistoryTab(i)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    historyTab === i
                      ? "bg-orange-500 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  Slide {i + 1}
                  {history.filter(h => h.slide_index === i).length > 0 && (
                    <span className="ml-1.5 bg-white/30 px-1.5 py-0.5 rounded-full text-[10px]">
                      {history.filter(h => h.slide_index === i).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {historyForTab.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FiClock size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-sm">No history yet for Slide {historyTab + 1}</p>
                <p className="text-xs mt-1">Upload a new image to save the current one here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {historyForTab.map(record => (
                  <div key={record.id}
                    className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all group">
                    {/* Image */}
                    <div className="relative bg-gray-50" style={{ aspectRatio: "16/6" }}>
                      <Image
                        src={record.image_url}
                        alt={record.alt || "Old slide"}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1">
                        <FiClock size={9} /> {timeAgo(record.changed_at)}
                      </p>
                      {record.alt && (
                        <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">{record.alt}</p>
                      )}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => restore(record)}
                          disabled={restoring === record.id}
                          className="flex-1 flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          title="Restore this image to the slider"
                        >
                          {restoring === record.id
                            ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <FiRotateCcw size={10} />
                          }
                          Restore
                        </button>
                        <button
                          onClick={() => deleteHistory(record.id)}
                          className="w-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete history record"
                        >
                          <FiTrash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── FULLSCREEN PREVIEW MODAL ── */}
      {previewIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewIdx(null)}
        >
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() => setPreviewIdx(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm font-bold flex items-center gap-1"
            >
              ✕ Close
            </button>
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1920/680" }}>
              <Image
                src={slides[previewIdx].image}
                alt={slides[previewIdx].alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <p className="text-white/50 text-xs text-center mt-3">Slide {previewIdx + 1} — {slides[previewIdx].alt}</p>
          </div>
        </div>
      )}
    </div>
  );
}
