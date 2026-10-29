"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { FiUpload, FiX, FiDownload, FiZap, FiRefreshCw, FiCheck, FiImage } from "react-icons/fi";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIProductInfo {
  productName: string;
  brandName: string;
  tagline: string;
  features: { icon: string; title: string; subtitle: string }[];
  bottomLabels: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function resizeForAI(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
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
      resolve({ base64: canvas.toDataURL("image/jpeg", 0.8).split(",")[1], mimeType: "image/jpeg" });
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Upload raw image to Cloudinary (for product store — not for bg removal)
async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "shreeambika_products");
  const res = await fetch("https://api.cloudinary.com/v1_1/zjlchjal/image/upload", {
    method: "POST", body: fd,
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || "Upload failed");
  return data.secure_url as string;
}

// Browser-side background removal using @imgly/background-removal
// 100% FREE — no API, no credits, runs in the browser using WebAssembly
async function removeBgInBrowser(file: File): Promise<string> {
  // Dynamic import so it doesn't affect initial page load
  const { removeBackground } = await import("@imgly/background-removal");
  const blob = await removeBackground(file, {
    model: "medium",           // "small" is faster, "medium" is higher quality
    output: { format: "image/png", quality: 0.9 },
  });
  return URL.createObjectURL(blob);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CardMakerPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState("");
  const [bgRemovedUrl, setBgRemovedUrl] = useState("");

  const [price, setPrice] = useState("");
  const [aiInfo, setAiInfo] = useState<AIProductInfo | null>(null);

  // Loading states
  const [removingBg, setRemovingBg] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [renderingCard, setRenderingCard] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "processing" | "editing" | "done">("upload");

  // Editable fields
  const [editBrand, setEditBrand] = useState("");
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editFeatures, setEditFeatures] = useState<{ icon: string; title: string; subtitle: string }[]>([]);
  const [editLabels, setEditLabels] = useState<string[]>([]);

  useEffect(() => {
    if (aiInfo) {
      setEditBrand(aiInfo.brandName);
      setEditName(aiInfo.productName);
      setEditTagline(aiInfo.tagline);
      setEditFeatures(aiInfo.features);
      setEditLabels(aiInfo.bottomLabels);
    }
  }, [aiInfo]);

  // Header image — Shree Ambika banner
  const [headerImg, setHeaderImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png";
    img.onload = () => setHeaderImg(img);
  }, []);

  // ── AI analyze product from image ─────────────────────────────────────────
  const analyzeWithAI = async (file: File): Promise<AIProductInfo> => {
    const { base64, mimeType } = await resizeForAI(file);
    const res = await fetch("/api/admin/generate-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "AI analysis failed");
    const d = json.data;

    const benefits: string[] = Array.isArray(d.key_benefits)
      ? d.key_benefits.slice(0, 4)
      : (d.description || "").split(".").filter(Boolean).slice(0, 4).map((s: string) => s.trim());

    const featureIcons = ["💎", "✨", "🛡️", "💧"];
    const featureSubtitles = ["Premium Quality", "Fast Results", "Long Lasting", "Easy to Use"];
    const features = benefits.map((b: string, i: number) => ({
      icon: featureIcons[i] || "⭐",
      title: b.length > 30 ? b.substring(0, 30) : b,
      subtitle: featureSubtitles[i] || "",
    }));

    const tags: string[] = Array.isArray(d.tags) ? d.tags.slice(0, 3) : [];
    const bottomLabels = tags.length >= 3
      ? tags.map((t: string) => t.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()))
      : features.slice(0, 3).map((f: { title: string }) => f.title.split(" ").slice(0, 3).join(" "));

    return {
      productName: d.name || "Product",
      brandName: d.brand || "Brand",
      tagline: d.suitable_for || d.seo_description?.split(".")[0] || "Professional Quality",
      features,
      bottomLabels,
    };
  };

  // ── Draw card on canvas ───────────────────────────────────────────────────
  const drawCard = useCallback(async (
    info: AIProductInfo, productImgUrl: string, priceVal: string,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRenderingCard(true);

    const W = 780, H = 1040;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // ── Header ──
    const HEADER_H = 130;
    if (headerImg) {
      ctx.drawImage(headerImg, 0, 0, W, HEADER_H);
    } else {
      const hGrad = ctx.createLinearGradient(0, 0, W, 0);
      hGrad.addColorStop(0, "#C41E3A"); hGrad.addColorStop(1, "#8B0000");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, 0, W, HEADER_H);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 32px Arial"; ctx.textAlign = "center";
      ctx.fillText("श्री अंबिका ब्यूटी शॉप", W / 2, 60);
      ctx.font = "13px Arial";
      ctx.fillText("VINOD: 8291455297  |  VIKRAM: 8824728350", W / 2, 90);
    }

    // ── Product image (left) ──
    const IMG_TOP = HEADER_H + 10;
    const IMG_H = 540;
    const IMG_W = Math.round(W * 0.52);

    await new Promise<void>((resolve) => {
      const productImg = new window.Image();
      productImg.crossOrigin = "anonymous";
      productImg.onload = () => {
        ctx.fillStyle = "#f8f8f8";
        ctx.fillRect(0, IMG_TOP, IMG_W, IMG_H);
        const scale = Math.min(IMG_W / productImg.width, IMG_H / productImg.height) * 0.88;
        const dw = productImg.width * scale;
        const dh = productImg.height * scale;
        ctx.drawImage(productImg, (IMG_W - dw) / 2, IMG_TOP + (IMG_H - dh) / 2, dw, dh);
        resolve();
      };
      productImg.onerror = () => {
        ctx.fillStyle = "#f0f0f0"; ctx.fillRect(0, IMG_TOP, IMG_W, IMG_H);
        ctx.fillStyle = "#bbb"; ctx.font = "16px Arial"; ctx.textAlign = "center";
        ctx.fillText("Product Image", IMG_W / 2, IMG_TOP + IMG_H / 2);
        resolve();
      };
      productImg.src = productImgUrl;
    });

    // ── Right panel ──
    const RX = IMG_W + 15;
    const RW = W - RX - 15;
    const RT = HEADER_H + 10;

    // Brand
    ctx.textAlign = "left";
    ctx.fillStyle = "#111";
    ctx.font = "bold 20px Arial";
    ctx.fillText(info.brandName.toUpperCase(), RX, RT + 32);
    ctx.font = "12px Arial"; ctx.fillStyle = "#888";
    ctx.fillText("PROFESSIONAL", RX, RT + 50);

    // Divider
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(RX, RT + 60); ctx.lineTo(RX + RW, RT + 60); ctx.stroke();

    // Product name
    ctx.fillStyle = "#111"; ctx.font = "bold 28px Arial";
    const words = info.productName.split(" ");
    let line = ""; let ly = RT + 98;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > RW && line) {
        ctx.fillText(line.trim(), RX, ly); line = word + " "; ly += 34;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), RX, ly); ly += 18;

    // Tagline
    ctx.font = "14px Arial"; ctx.fillStyle = "#666";
    ctx.fillText(info.tagline.substring(0, 38), RX, ly + 14);

    // Features
    let fy = ly + 54;
    for (const feat of info.features.slice(0, 4)) {
      ctx.fillStyle = "#f3f4f6";
      ctx.beginPath(); ctx.arc(RX + 18, fy - 7, 18, 0, Math.PI * 2); ctx.fill();
      ctx.font = "15px Arial"; ctx.textAlign = "center";
      ctx.fillText(feat.icon, RX + 18, fy - 1);
      ctx.textAlign = "left";
      ctx.font = "bold 12px Arial"; ctx.fillStyle = "#222";
      ctx.fillText(feat.title, RX + 44, fy - 8);
      ctx.font = "11px Arial"; ctx.fillStyle = "#999";
      ctx.fillText(feat.subtitle, RX + 44, fy + 6);
      fy += 44;
    }

    // ── Price box ──
    const PY = IMG_TOP + IMG_H - 10;
    ctx.fillStyle = "#111111";
    const r2 = 12;
    ctx.beginPath();
    ctx.moveTo(RX + r2, PY); ctx.lineTo(RX + RW - r2, PY);
    ctx.quadraticCurveTo(RX + RW, PY, RX + RW, PY + r2);
    ctx.lineTo(RX + RW, PY + 68 - r2);
    ctx.quadraticCurveTo(RX + RW, PY + 68, RX + RW - r2, PY + 68);
    ctx.lineTo(RX + r2, PY + 68);
    ctx.quadraticCurveTo(RX, PY + 68, RX, PY + 68 - r2);
    ctx.lineTo(RX, PY + r2);
    ctx.quadraticCurveTo(RX, PY, RX + r2, PY);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 44px Arial"; ctx.textAlign = "center";
    ctx.fillText(`₹${priceVal}`, RX + RW / 2, PY + 50);

    // ── Bottom labels strip ──
    const BY = IMG_TOP + IMG_H + 20;
    const BH = H - BY - 10;
    ctx.fillStyle = "#fafafa"; ctx.fillRect(0, BY, W, BH);
    const lW = W / 3;
    for (let i = 0; i < 3; i++) {
      if (i > 0) {
        ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(i * lW, BY + 8); ctx.lineTo(i * lW, BY + BH - 8); ctx.stroke();
      }
      ctx.fillStyle = "#444"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center";
      ctx.fillText(info.bottomLabels[i] || "", i * lW + lW / 2, BY + BH / 2 + 5);
    }

    setRenderingCard(false);
    setCardReady(true);
    setDownloadUrl(canvas.toDataURL("image/png"));
  }, [headerImg]);

  // ── Main flow: file selected ──────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    setError(""); setCardReady(false); setDownloadUrl(""); setAiInfo(null);
    setBgRemovedUrl(""); setRawFile(file);
    setRawPreview(URL.createObjectURL(file));
    setStep("processing");

    // Run bg removal + AI analysis in parallel
    try {
      setBgProgress(5);
      setRemovingBg(true);
      setAnalyzingAI(true);

      const [bgUrl, info] = await Promise.all([
        // 1. Browser-side background removal (FREE, unlimited)
        (async () => {
          setBgProgress(20);
          const url = await removeBgInBrowser(file);
          setBgProgress(100);
          return url;
        })(),
        // 2. AI product analysis
        analyzeWithAI(file),
      ]);

      setBgRemovedUrl(bgUrl);
      setAiInfo(info);
      setRemovingBg(false);
      setAnalyzingAI(false);
      setStep("editing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed. Please try again.");
      setStep("upload");
      setRemovingBg(false);
      setAnalyzingAI(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (!bgRemovedUrl || !price) { setError("Please enter the price first."); return; }
    setError("");
    const info: AIProductInfo = {
      productName: editName, brandName: editBrand,
      tagline: editTagline, features: editFeatures, bottomLabels: editLabels,
    };
    await drawCard(info, bgRemovedUrl, price);
    setStep("done");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
  };

  const reset = () => {
    if (rawPreview) URL.revokeObjectURL(rawPreview);
    if (bgRemovedUrl) URL.revokeObjectURL(bgRemovedUrl);
    setRawFile(null); setRawPreview(""); setBgRemovedUrl(""); setAiInfo(null);
    setPrice(""); setCardReady(false); setDownloadUrl(""); setError("");
    setStep("upload"); setBgProgress(0);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiImage className="text-brand-primary" /> Product Card Maker
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload karo → AI product details padhega → Background automatically hatega → Card ready
        </p>
        {/* Free badge */}
        <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          <FiCheck size={11} /> 100% Free · Unlimited · No API credits used · Runs in your browser
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-5 text-sm flex items-center gap-2">
          <FiX size={14} /> {error}
          <button onClick={() => setError("")} className="ml-auto"><FiX size={14} /></button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── LEFT: Upload + Controls ── */}
        <div className="space-y-5">

          {/* Upload zone */}
          {step === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-brand-accent hover:border-brand-primary rounded-2xl p-10 text-center cursor-pointer hover:bg-brand-light transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-brand-light border-2 border-brand-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FiUpload size={28} className="text-brand-primary" />
              </div>
              <p className="font-bold text-gray-700 text-lg mb-1">Product Photo Upload Karo</p>
              <p className="text-gray-400 text-sm">Koi bhi raw photo — haath mein pakdi, shelf pe, box</p>
              <p className="text-gray-400 text-xs mt-2">JPG / PNG / WebP · Drag & drop or click</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

          {/* Raw preview + processing status */}
          {rawPreview && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-gray-700">Original Photo</span>
                <button onClick={reset} className="text-gray-400 hover:text-red-500"><FiX size={16} /></button>
              </div>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                <Image src={rawPreview} alt="raw" fill className="object-contain" />
              </div>

              {/* Status steps */}
              <div className="mt-4 space-y-3">
                <StatusRow
                  label="Background Remove (Browser AI — Free)"
                  state={removingBg ? "loading" : bgRemovedUrl ? "done" : "pending"}
                  progress={removingBg ? bgProgress : bgRemovedUrl ? 100 : 0}
                  showProgress={removingBg}
                />
                <StatusRow
                  label="AI Product Details Read kar raha hai"
                  state={analyzingAI ? "loading" : aiInfo ? "done" : "pending"}
                />
              </div>
            </div>
          )}

          {/* BG removed preview */}
          {bgRemovedUrl && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
              <p className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-1.5">
                <FiCheck /> Background Hata Diya ✅
              </p>
              {/* Checkered background to show transparency */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden"
                style={{ background: "repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 20px 20px" }}>
                <Image src={bgRemovedUrl} alt="bg removed" fill className="object-contain" unoptimized />
              </div>
            </div>
          )}

          {/* Edit panel */}
          {(step === "editing" || step === "done") && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FiZap className="text-brand-primary" /> Card Details Edit Karo
              </h3>

              {/* Price — most important, top */}
              <div className="bg-brand-light rounded-xl p-3 border border-brand-accent">
                <label className="text-xs font-bold text-brand-primary uppercase tracking-wide mb-1 block">₹ Price *</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 389"
                  className="w-full bg-transparent border-none text-2xl font-black text-gray-800 outline-none text-center tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Brand</label>
                  <input value={editBrand} onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Tagline</label>
                  <input value={editTagline} onChange={(e) => setEditTagline(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-primary outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Product Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-primary outline-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Features (4)</label>
                <div className="space-y-2">
                  {editFeatures.map((f, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={f.icon} onChange={(e) => { const nf = [...editFeatures]; nf[i] = { ...nf[i], icon: e.target.value }; setEditFeatures(nf); }}
                        className="w-10 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" />
                      <input value={f.title} onChange={(e) => { const nf = [...editFeatures]; nf[i] = { ...nf[i], title: e.target.value }; setEditFeatures(nf); }}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-brand-primary outline-none" />
                      <input value={f.subtitle} onChange={(e) => { const nf = [...editFeatures]; nf[i] = { ...nf[i], subtitle: e.target.value }; setEditFeatures(nf); }}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 focus:border-brand-primary outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Bottom Labels (3)</label>
                <div className="flex gap-2">
                  {editLabels.map((l, i) => (
                    <input key={i} value={l}
                      onChange={(e) => { const nl = [...editLabels]; nl[i] = e.target.value; setEditLabels(nl); }}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:border-brand-primary outline-none" />
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!price || renderingCard}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #C41E3A, #e91e8c)" }}>
                {renderingCard
                  ? <><FiRefreshCw className="animate-spin" size={16} /> Card Ban Raha Hai...</>
                  : <><FiZap size={16} /> {cardReady ? "Card Dobara Banao" : "Card Banao"}</>}
              </button>
            </div>
          )}

          {/* Price input while processing */}
          {step === "processing" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Price Enter Karo (AI kaam kar raha hai) ₹</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 389"
                className="w-full border-2 border-brand-accent rounded-xl px-4 py-3 text-2xl font-black text-center focus:border-brand-primary outline-none tracking-widest" />
              <p className="text-xs text-gray-400 mt-2 text-center">Baaki sab AI khud fill karega</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Canvas preview ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-gray-700">Card Preview</span>
              {cardReady && (
                <a href={downloadUrl}
                  download={`${editName || "product"}-shreeambika.png`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold"
                  style={{ background: "#25D366" }}>
                  <FiDownload size={14} /> Download
                </a>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[400px]">
              <canvas ref={canvasRef} className="w-full h-auto"
                style={{ maxWidth: "100%", display: cardReady ? "block" : "none" }} />
              {!cardReady && (
                <div className="text-center text-gray-300 py-20">
                  <FiImage size={48} className="mx-auto mb-3" />
                  <p className="text-sm font-medium">Card yahan dikhega</p>
                  <p className="text-xs mt-1">Photo upload karo + Price daalo → Generate karo</p>
                </div>
              )}
            </div>

            {cardReady && (
              <div className="mt-3 p-3 bg-green-50 rounded-xl text-xs text-green-700 space-y-1">
                <p className="font-bold">✅ Card Ready!</p>
                <p>• WhatsApp, Instagram, Facebook — sab jagah share karo</p>
                <p>• 780×1040px — perfect size for all platforms</p>
                <p>• Shree Ambika branding automatically included</p>
              </div>
            )}
          </div>

          {/* How it works */}
          {step === "upload" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="font-bold text-gray-700 text-sm mb-4">Kaise Kaam Karta Hai?</p>
              <div className="space-y-3">
                {[
                  { n: "1", t: "Photo Upload Karo", d: "Koi bhi raw photo — haath mein pakdi, blister pack, box, shelf" },
                  { n: "2", t: "AI Background Hatata Hai", d: "Browser mein hi hota hai — koi API nahi, bilkul free, unlimited" },
                  { n: "3", t: "AI Product Padhta Hai", d: "Product name, brand, features — Gemini AI automatically fill karta hai" },
                  { n: "4", t: "Price Daalo → Card Ready!", d: "Edit karo ya seedha generate karo — Shree Ambika branded card" },
                ].map((s) => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{s.t}</p>
                      <p className="text-xs text-gray-400">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Status Row ────────────────────────────────────────────────────────────────
function StatusRow({
  label, state, progress, showProgress,
}: {
  label: string; state: "pending" | "loading" | "done";
  progress?: number; showProgress?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          state === "done" ? "bg-green-100" : state === "loading" ? "bg-yellow-100" : "bg-gray-100"
        }`}>
          {state === "done" && <FiCheck size={11} className="text-green-500" />}
          {state === "loading" && <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />}
          {state === "pending" && <div className="w-2 h-2 rounded-full bg-gray-300" />}
        </div>
        <span className={`text-xs ${
          state === "done" ? "text-green-600 font-semibold" : state === "loading" ? "text-yellow-600 font-semibold" : "text-gray-400"
        }`}>{label}</span>
        {state === "done" && <span className="text-xs text-green-500 ml-auto">✓</span>}
      </div>
      {showProgress && state === "loading" && (
        <div className="mt-1.5 ml-8">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${progress || 0}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
