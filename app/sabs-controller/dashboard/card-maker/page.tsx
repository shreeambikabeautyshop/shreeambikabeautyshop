"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { FiUpload, FiX, FiDownload, FiZap, FiRefreshCw, FiCheck, FiImage, FiAlertCircle } from "react-icons/fi";
import Image from "next/image";

interface AIProductInfo {
  productName: string;
  brandName: string;
  tagline: string;
  features: { icon: string; title: string; subtitle: string }[];
  bottomLabels: string[];
}

// ── resize image for APIs ─────────────────────────────────────────────────────
function resizeImage(file: File, maxPx = 1024): Promise<{ base64: string; mimeType: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
        else { width = Math.round((width * maxPx) / height); height = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg", blob });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.85);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── HF BRIA RMBG-2.0 background removal via our API route ────────────────────
// Falls back to browser-side @imgly if HF token not configured
async function removeBgHF(base64: string, mimeType: string, retryCount = 0): Promise<string> {
  const res = await fetch("/api/admin/remove-bg", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  const json = await res.json();

  // No HF token — fall back to browser-side WASM model
  if (res.status === 422 && json.fallback) {
    console.log("HF token not set — using browser-side @imgly fallback");
    const { removeBackground } = await import("@imgly/background-removal");
    // Convert base64 back to Blob
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeType });
    const resultBlob = await removeBackground(blob, {
      model: "medium",
      output: { format: "image/png", quality: 0.9 },
    });
    return URL.createObjectURL(resultBlob);
  }

  // Model cold-start — wait and retry (max 3 times)
  if (res.status === 503 && json.error === "model_loading" && retryCount < 3) {
    await new Promise((r) => setTimeout(r, (json.retryAfter || 20) * 1000));
    return removeBgHF(base64, mimeType, retryCount + 1);
  }
  if (!res.ok) throw new Error(json.error || "Background removal failed");
  return `data:image/png;base64,${json.imageBase64}`;
}

// ── AI product analysis ───────────────────────────────────────────────────────
async function analyzeWithAI(base64: string, mimeType: string): Promise<AIProductInfo> {
  const res = await fetch("/api/admin/generate-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "AI analysis failed");
  const d = json.data;

  const benefits: string[] = Array.isArray(d.key_benefits) ? d.key_benefits.slice(0, 4) : [];
  const icons = ["💎", "✨", "🛡️", "💧"];
  const subs = ["Premium Quality", "Fast Results", "Long Lasting", "Easy to Use"];
  const features = benefits.map((b: string, i: number) => ({
    icon: icons[i] || "⭐",
    title: b.length > 28 ? b.substring(0, 28) : b,
    subtitle: subs[i] || "",
  }));

  const tags: string[] = Array.isArray(d.tags) ? d.tags.slice(0, 3) : [];
  const bottomLabels = tags.length >= 3
    ? tags.map((t: string) => t.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()))
    : features.slice(0, 3).map((f: { title: string }) => f.title.split(" ").slice(0, 3).join(" "));

  return {
    productName: d.name || "Product",
    brandName: d.brand || "Brand",
    tagline: d.suitable_for || "",
    features,
    bottomLabels,
  };
}

// ── Draw card — pixel-perfect Shills template ─────────────────────────────────
async function drawShillsCard(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  headerImg: HTMLImageElement | null,
  productImgSrc: string,
  info: AIProductInfo,
  price: string,
) {
  // Clear
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // ── 1. Header banner ──────────────────────────────────────────────────────
  const HDR_H = Math.round(H * 0.135); // ~14% of height
  if (headerImg) {
    ctx.drawImage(headerImg, 0, 0, W, HDR_H);
  } else {
    // Fallback gradient header
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "#8B0000"); g.addColorStop(0.5, "#C41E3A"); g.addColorStop(1, "#8B0000");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, HDR_H);
    ctx.fillStyle = "#fff8dc";
    ctx.font = `bold ${Math.round(HDR_H * 0.28)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("श्री अंबिका ब्यूटी शॉप", W / 2, HDR_H * 0.52);
    ctx.font = `${Math.round(HDR_H * 0.15)}px sans-serif`;
    ctx.fillStyle = "#ffe4b5";
    ctx.fillText("VINOD: 8291455297  •  VIKRAM: 8824728350", W / 2, HDR_H * 0.78);
  }

  // ── 2. Layout constants ───────────────────────────────────────────────────
  const BODY_TOP = HDR_H + 2;
  const LEFT_W = Math.round(W * 0.50);    // product image takes 50%
  const RIGHT_X = LEFT_W + 12;
  const RIGHT_W = W - RIGHT_X - 12;
  const BODY_H = Math.round(H * 0.73);    // main body height
  const BODY_BTM = BODY_TOP + BODY_H;
  const STRIP_H = H - BODY_BTM;           // bottom label strip

  // Light gray background for product image area
  ctx.fillStyle = "#f7f7f7";
  ctx.fillRect(0, BODY_TOP, LEFT_W, BODY_H);

  // ── 3. Product image (bg-removed, centred left) ───────────────────────────
  await new Promise<void>((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const pad = 24;
      const maxW = LEFT_W - pad * 2;
      const maxH = BODY_H - pad * 2;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (LEFT_W - dw) / 2;
      const dy = BODY_TOP + (BODY_H - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      resolve();
    };
    img.onerror = () => {
      ctx.fillStyle = "#ddd"; ctx.fillRect(12, BODY_TOP + 12, LEFT_W - 24, BODY_H - 24);
      resolve();
    };
    img.src = productImgSrc;
  });

  // ── 4. RIGHT side: brand + product name + tagline + features + price ──────
  let curY = BODY_TOP + 20;

  // Brand name (bold, large, dark)
  ctx.textAlign = "left";
  const brandFontSz = Math.round(W * 0.040);
  ctx.font = `900 ${brandFontSz}px Arial Black, Arial`;
  ctx.fillStyle = "#111111";
  ctx.fillText(info.brandName.toUpperCase(), RIGHT_X, curY + brandFontSz);
  curY += brandFontSz + 4;

  // "PROFESSIONAL" subtitle
  const proFontSz = Math.round(W * 0.020);
  ctx.font = `${proFontSz}px Arial`;
  ctx.fillStyle = "#777777";
  ctx.fillText("PROFESSIONAL", RIGHT_X, curY + proFontSz);
  curY += proFontSz + 10;

  // Thin divider
  ctx.strokeStyle = "#dddddd"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(RIGHT_X, curY); ctx.lineTo(RIGHT_X + RIGHT_W, curY); ctx.stroke();
  curY += 14;

  // Product name — large, bold, multi-line, wraps nicely
  const nameFontSz = Math.round(W * 0.052);
  ctx.font = `bold ${nameFontSz}px Arial`;
  ctx.fillStyle = "#0d0d0d";
  const nameWords = info.productName.split(" ");
  let nameLine = "";
  const nameLines: string[] = [];
  for (const w of nameWords) {
    const test = nameLine + w + " ";
    if (ctx.measureText(test).width > RIGHT_W && nameLine) {
      nameLines.push(nameLine.trim()); nameLine = w + " ";
    } else { nameLine = test; }
  }
  if (nameLine.trim()) nameLines.push(nameLine.trim());
  for (const nl of nameLines) {
    ctx.fillText(nl, RIGHT_X, curY + nameFontSz);
    curY += nameFontSz + 4;
  }
  curY += 6;

  // Tagline (if present)
  if (info.tagline) {
    const tagFontSz = Math.round(W * 0.025);
    ctx.font = `${tagFontSz}px Arial`;
    ctx.fillStyle = "#555555";
    const tag = info.tagline.length > 42 ? info.tagline.substring(0, 42) : info.tagline;
    ctx.fillText(tag, RIGHT_X, curY + tagFontSz);
    curY += tagFontSz + 14;
  } else { curY += 8; }

  // ── Features list — circle icon + bold title + grey subtitle ─────────────
  const featFontSz = Math.round(W * 0.026);
  const circleR = Math.round(W * 0.030);
  const featRowH = circleR * 2 + 10;

  for (const feat of info.features.slice(0, 4)) {
    const cx = RIGHT_X + circleR;
    const cy = curY + circleR;

    // Circle background
    ctx.fillStyle = "#f0f0f0";
    ctx.beginPath(); ctx.arc(cx, cy, circleR, 0, Math.PI * 2); ctx.fill();

    // Icon (emoji)
    ctx.font = `${Math.round(circleR * 1.1)}px serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.fillText(feat.icon, cx, cy + Math.round(circleR * 0.38));

    // Feature title
    ctx.textAlign = "left";
    ctx.font = `bold ${featFontSz}px Arial`;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillText(feat.title, RIGHT_X + circleR * 2 + 8, cy - 4);

    // Feature subtitle
    ctx.font = `${Math.round(featFontSz * 0.85)}px Arial`;
    ctx.fillStyle = "#888888";
    ctx.fillText(feat.subtitle, RIGHT_X + circleR * 2 + 8, cy + featFontSz - 2);

    curY += featRowH;
  }

  curY += 8;

  // ── Price box — big, bold, black background ───────────────────────────────
  const priceBoxH = Math.round(W * 0.10);
  const priceBoxY = BODY_BTM - priceBoxH - 10;
  const priceBoxX = RIGHT_X;
  const priceBoxW = RIGHT_W;
  const pbR = 10;

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.moveTo(priceBoxX + pbR, priceBoxY);
  ctx.lineTo(priceBoxX + priceBoxW - pbR, priceBoxY);
  ctx.quadraticCurveTo(priceBoxX + priceBoxW, priceBoxY, priceBoxX + priceBoxW, priceBoxY + pbR);
  ctx.lineTo(priceBoxX + priceBoxW, priceBoxY + priceBoxH - pbR);
  ctx.quadraticCurveTo(priceBoxX + priceBoxW, priceBoxY + priceBoxH, priceBoxX + priceBoxW - pbR, priceBoxY + priceBoxH);
  ctx.lineTo(priceBoxX + pbR, priceBoxY + priceBoxH);
  ctx.quadraticCurveTo(priceBoxX, priceBoxY + priceBoxH, priceBoxX, priceBoxY + priceBoxH - pbR);
  ctx.lineTo(priceBoxX, priceBoxY + pbR);
  ctx.quadraticCurveTo(priceBoxX, priceBoxY, priceBoxX + pbR, priceBoxY);
  ctx.closePath();
  ctx.fill();

  const priceFontSz = Math.round(priceBoxH * 0.68);
  ctx.font = `900 ${priceFontSz}px Arial Black, Arial`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(`₹${price}`, priceBoxX + priceBoxW / 2, priceBoxY + priceBoxH * 0.72);

  // ── 5. Bottom strip — 3 labels ────────────────────────────────────────────
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, BODY_BTM, W, STRIP_H);

  // Top border on strip
  ctx.strokeStyle = "#e0e0e0"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, BODY_BTM); ctx.lineTo(W, BODY_BTM); ctx.stroke();

  const lblW = W / 3;
  const lblFontSz = Math.round(STRIP_H * 0.30);
  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      ctx.strokeStyle = "#dedede"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(i * lblW, BODY_BTM + 8); ctx.lineTo(i * lblW, H - 8); ctx.stroke();
    }
    ctx.fillStyle = "#444444";
    ctx.font = `bold ${lblFontSz}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(
      (info.bottomLabels[i] || "").substring(0, 16),
      i * lblW + lblW / 2,
      BODY_BTM + STRIP_H / 2 + lblFontSz * 0.38,
    );
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CardMakerPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [rawPreview, setRawPreview] = useState("");
  const [bgRemovedSrc, setBgRemovedSrc] = useState("");

  const [price, setPrice] = useState("");
  const [aiInfo, setAiInfo] = useState<AIProductInfo | null>(null);

  const [step, setStep] = useState<"upload" | "processing" | "editing" | "done">("upload");
  const [bgStatus, setBgStatus] = useState<"pending" | "loading" | "done" | "error">("pending");
  const [bgMsg, setBgMsg] = useState("");
  const [aiStatus, setAiStatus] = useState<"pending" | "loading" | "done" | "error">("pending");
  const [renderingCard, setRenderingCard] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");

  // Editable fields
  const [editBrand, setEditBrand] = useState("");
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editFeatures, setEditFeatures] = useState<{ icon: string; title: string; subtitle: string }[]>([]);
  const [editLabels, setEditLabels] = useState<string[]>([]);

  useEffect(() => {
    if (aiInfo) {
      setEditBrand(aiInfo.brandName); setEditName(aiInfo.productName);
      setEditTagline(aiInfo.tagline); setEditFeatures(aiInfo.features);
      setEditLabels(aiInfo.bottomLabels);
    }
  }, [aiInfo]);

  // Preload header image
  const [headerImg, setHeaderImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png";
    img.onload = () => setHeaderImg(img);
  }, []);

  // ── Generate card ─────────────────────────────────────────────────────────
  const generateCard = useCallback(async (info: AIProductInfo, bgSrc: string, priceVal: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRenderingCard(true);
    const W = 800, H = 1067; // 3:4 ratio — standard product card
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    await drawShillsCard(ctx, W, H, headerImg, bgSrc, info, priceVal);
    setRenderingCard(false);
    setCardReady(true);
    setDownloadUrl(canvas.toDataURL("image/png", 1.0));
  }, [headerImg]);

  // ── Main flow ─────────────────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    setError(""); setCardReady(false); setDownloadUrl(""); setAiInfo(null);
    setBgRemovedSrc(""); setRawPreview(URL.createObjectURL(file));
    setStep("processing");
    setBgStatus("pending"); setAiStatus("pending"); setBgMsg("");

    try {
      // Resize once for both APIs
      const { base64, mimeType } = await resizeImage(file, 1024);

      // Run BG removal + AI in parallel
      setBgStatus("loading"); setBgMsg("BRIA RMBG-2.0 background remove kar raha hai...");
      setAiStatus("loading");

      const [bgSrc, info] = await Promise.all([
        removeBgHF(base64, mimeType).then((src) => {
          setBgStatus("done"); setBgMsg(""); return src;
        }).catch((err) => {
          setBgStatus("error"); setBgMsg(err.message);
          // Fallback: use original image if bg removal fails
          return `data:${mimeType};base64,${base64}`;
        }),
        analyzeWithAI(base64, mimeType).then((i) => {
          setAiStatus("done"); return i;
        }).catch(() => {
          setAiStatus("error");
          return { productName: "Product", brandName: "Brand", tagline: "", features: [], bottomLabels: ["Feature 1", "Feature 2", "Feature 3"] };
        }),
      ]);

      setBgRemovedSrc(bgSrc);
      setAiInfo(info);
      setStep("editing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
      setStep("upload");
    }
  }, []);

  const handleGenerate = async () => {
    if (!price) { setError("Price daalna zaroori hai."); return; }
    setError("");
    const info: AIProductInfo = { productName: editName, brandName: editBrand, tagline: editTagline, features: editFeatures, bottomLabels: editLabels };
    await generateCard(info, bgRemovedSrc || rawPreview, price);
    setStep("done");
  };

  const reset = () => {
    if (rawPreview) URL.revokeObjectURL(rawPreview);
    setRawPreview(""); setBgRemovedSrc(""); setAiInfo(null); setPrice("");
    setCardReady(false); setDownloadUrl(""); setError(""); setStep("upload");
    setBgStatus("pending"); setAiStatus("pending");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiImage className="text-brand-primary" /> Product Card Maker
        </h1>
        <p className="text-gray-500 text-sm mt-1">Raw photo upload → AI background remove → Shree Ambika branded card</p>
        <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          <FiCheck size={11} /> Hugging Face BRIA RMBG-2.0 · High quality · Free
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-5 text-sm flex gap-2">
          <FiAlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
          <button onClick={() => setError("")} className="ml-auto"><FiX size={13} /></button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-4">

          {/* Upload zone */}
          {step === "upload" && (
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-brand-accent hover:border-brand-primary rounded-2xl p-10 text-center cursor-pointer hover:bg-brand-light transition-all group">
              <div className="w-16 h-16 rounded-full bg-brand-light border-2 border-brand-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FiUpload size={28} className="text-brand-primary" />
              </div>
              <p className="font-bold text-gray-700 text-lg mb-1">Product Photo Upload Karo</p>
              <p className="text-gray-400 text-sm">Koi bhi raw photo — hand, shelf, box, blister pack</p>
              <p className="text-gray-400 text-xs mt-2">JPG / PNG · Drag & drop or click</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

          {/* Raw preview + status */}
          {rawPreview && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-gray-700">Original Photo</span>
                <button onClick={reset} className="text-gray-400 hover:text-red-500"><FiX size={16} /></button>
              </div>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                <Image src={rawPreview} alt="raw" fill className="object-contain" unoptimized />
              </div>
              <div className="mt-3 space-y-2.5">
                <StatusRow label="Background Remove (BRIA RMBG-2.0)" state={bgStatus} note={bgMsg} />
                <StatusRow label="AI Product Details Read kar raha hai" state={aiStatus} />
              </div>
            </div>
          )}

          {/* BG removed preview */}
          {bgRemovedSrc && bgStatus === "done" && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
              <p className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-1.5">
                <FiCheck size={13} /> Background Hata Diya
              </p>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden"
                style={{ background: "repeating-conic-gradient(#e5e7eb 0% 25%,white 0% 50%) 0 0/20px 20px" }}>
                <Image src={bgRemovedSrc} alt="bg removed" fill className="object-contain" unoptimized />
              </div>
            </div>
          )}

          {/* Edit panel */}
          {(step === "editing" || step === "done") && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FiZap className="text-brand-primary" /> Card Details Edit Karo
              </h3>

              {/* Price — hero field */}
              <div className="bg-brand-light rounded-xl p-3 border border-brand-accent">
                <label className="text-xs font-bold text-brand-primary uppercase tracking-wide mb-1 block">₹ Price *</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 389"
                  className="w-full bg-transparent text-2xl font-black text-gray-800 outline-none text-center tracking-widest border-none" />
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Features (4) — Icon · Title · Subtitle</label>
                <div className="space-y-2">
                  {editFeatures.map((f, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <input value={f.icon} onChange={(e) => { const n = [...editFeatures]; n[i] = { ...n[i], icon: e.target.value }; setEditFeatures(n); }}
                        className="w-9 border border-gray-200 rounded-lg px-1.5 py-1.5 text-sm text-center flex-shrink-0" />
                      <input value={f.title} onChange={(e) => { const n = [...editFeatures]; n[i] = { ...n[i], title: e.target.value }; setEditFeatures(n); }}
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-primary outline-none" />
                      <input value={f.subtitle} onChange={(e) => { const n = [...editFeatures]; n[i] = { ...n[i], subtitle: e.target.value }; setEditFeatures(n); }}
                        className="w-28 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 focus:border-brand-primary outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Bottom Labels (3)</label>
                <div className="flex gap-2">
                  {(editLabels.length === 0 ? ["", "", ""] : editLabels).map((l, i) => (
                    <input key={i} value={l}
                      onChange={(e) => { const nl = [...(editLabels.length ? editLabels : ["","",""])]; nl[i] = e.target.value; setEditLabels(nl); }}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:border-brand-primary outline-none" />
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!price || renderingCard}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg,#C41E3A,#e91e8c)" }}>
                {renderingCard
                  ? <><FiRefreshCw className="animate-spin" size={15} /> Card Ban Raha Hai...</>
                  : <><FiZap size={15} /> {cardReady ? "Dobara Banao" : "Card Banao"}</>}
              </button>
            </div>
          )}

          {/* Price while processing */}
          {step === "processing" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Price Enter Karo (AI kaam kar raha hai) ₹</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 389"
                className="w-full border-2 border-brand-accent rounded-xl px-4 py-3 text-2xl font-black text-center focus:border-brand-primary outline-none tracking-widest" />
              <p className="text-xs text-gray-400 mt-2 text-center">Baaki sab AI khud bharta hai</p>
            </div>
          )}
        </div>

        {/* RIGHT — canvas preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-gray-700">Card Preview</span>
              {cardReady && (
                <a href={downloadUrl} download={`${editName || "product"}-shreeambika.png`}
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
                  <p className="text-sm font-medium">Card Preview</p>
                  <p className="text-xs mt-1 text-gray-300">Photo upload → Price → Generate</p>
                </div>
              )}
            </div>
            {cardReady && (
              <div className="mt-3 p-3 bg-green-50 rounded-xl text-xs text-green-700 space-y-1">
                <p className="font-bold">✅ Card Ready — 800×1067px</p>
                <p>WhatsApp, Instagram, Facebook — sab jagah perfect</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, state, note }: { label: string; state: "pending"|"loading"|"done"|"error"; note?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        state === "done" ? "bg-green-100" : state === "loading" ? "bg-yellow-100" : state === "error" ? "bg-red-100" : "bg-gray-100"
      }`}>
        {state === "done" && <FiCheck size={11} className="text-green-500" />}
        {state === "loading" && <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />}
        {state === "error" && <FiX size={11} className="text-red-500" />}
        {state === "pending" && <div className="w-2 h-2 rounded-full bg-gray-300" />}
      </div>
      <div>
        <span className={`text-xs ${
          state === "done" ? "text-green-600 font-semibold" : state === "loading" ? "text-yellow-600 font-semibold" : state === "error" ? "text-red-500" : "text-gray-400"
        }`}>{label}</span>
        {note && <p className="text-[10px] text-gray-400 mt-0.5">{note}</p>}
      </div>
    </div>
  );
}
