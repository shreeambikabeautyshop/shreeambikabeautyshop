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

// ── Resize image for API ──────────────────────────────────────────────────────
function resizeImage(file: File, maxPx = 1024): Promise<{ base64: string; mimeType: string }> {
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
        reader.onload = () => resolve({ base64: (reader.result as string).split(",")[1], mimeType: "image/jpeg" });
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.85);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── HF BRIA RMBG-2.0 background removal ──────────────────────────────────────
async function removeBgHF(base64: string, mimeType: string, retryCount = 0): Promise<string> {
  try {
    const res = await fetch("/api/admin/remove-bg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType }),
    });
    const json = await res.json();
    if (res.status === 422 && json.fallback) return `data:${mimeType};base64,${base64}`;
    if (res.status === 503 && json.error === "model_loading" && retryCount < 3) {
      await new Promise((r) => setTimeout(r, (json.retryAfter || 20) * 1000));
      return removeBgHF(base64, mimeType, retryCount + 1);
    }
    if (!res.ok) return `data:${mimeType};base64,${base64}`;
    return `data:image/png;base64,${json.imageBase64}`;
  } catch {
    return `data:${mimeType};base64,${base64}`;
  }
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
  const icons = ["💎", "✂️", "🤝", "🛡️"];
  const subs = ["Premium Quality", "High Performance", "Professional Grade", "Long Lasting"];
  const features = benefits.length > 0
    ? benefits.map((b: string, i: number) => ({
        icon: icons[i] || "⭐",
        title: b.length > 26 ? b.substring(0, 26) : b,
        subtitle: subs[i] || "",
      }))
    : icons.map((ic, i) => ({ icon: ic, title: subs[i], subtitle: "" }));
  const tags: string[] = Array.isArray(d.tags) ? d.tags.slice(0, 3) : [];
  const bottomLabels = tags.length >= 3
    ? tags.map((t: string) =>
        t.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
      )
    : [d.brand || "Feature 1", "Feature 2", "Feature 3"];
  return {
    productName: d.name || "Product",
    brandName: d.brand || "Brand",
    tagline: d.suitable_for || d.description?.split(".")[0] || "Professional Quality",
    features,
    bottomLabels,
  };
  function info() { return {}; }
}

// ── Load image helper ─────────────────────────────────────────────────────────
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("img load failed"));
    img.src = src;
  });
}

// ── Wrap text helper ──────────────────────────────────────────────────────────
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxW && line) { lines.push(line.trim()); line = w + " "; }
    else line = test;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

// ────────────────────────────────────────────────────────────────────────────
// DRAW CARD — exact Solingen/Shills template structure
// ────────────────────────────────────────────────────────────────────────────
async function drawCard(
  canvas: HTMLCanvasElement,
  headerImg: HTMLImageElement | null,
  productImgSrc: string,
  info: AIProductInfo,
  price: string,
) {
  const W = 780, H = 1040;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Background white ──
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // ── 1. HEADER ──────────────────────────────────────────────────────────────
  const HDR_H = 128;
  if (headerImg) {
    ctx.drawImage(headerImg, 0, 0, W, HDR_H);
  } else {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "#8B0000"); g.addColorStop(0.5, "#C41E3A"); g.addColorStop(1, "#8B0000");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, HDR_H);
    ctx.fillStyle = "#FFD700"; ctx.font = "bold 38px serif"; ctx.textAlign = "center";
    ctx.fillText("श्री अंबिका", W / 2, 52);
    ctx.fillStyle = "#fff"; ctx.font = "bold 16px Arial";
    ctx.fillText("ब्यूटी शॉप | रिटेल वेडिंग ड्रेस", W / 2, 76);
    ctx.font = "11px Arial";
    ctx.fillText("VINOD: 8291455297    VIKRAM: 8824728350    FREE HOME DELIVERY", W / 2, 102);
  }

  // ── 2. LAYOUT ──────────────────────────────────────────────────────────────
  const BODY_TOP = HDR_H + 6;
  const STRIP_H = 118;    // bottom thumbnail strip
  const BODY_H = H - BODY_TOP - STRIP_H;
  const LEFT_W = Math.round(W * 0.488);
  const RIGHT_X = LEFT_W + 12;
  const RIGHT_W = W - RIGHT_X - 12;

  // ── 3. LEFT — product image on light gray ──────────────────────────────────
  ctx.fillStyle = "#f7f7f7";
  ctx.fillRect(0, BODY_TOP, LEFT_W, BODY_H);

  // Subtle decorative swirl behind product (like Shills template)
  const swX = LEFT_W * 0.5, swY = BODY_TOP + BODY_H * 0.42;
  const swGrad = ctx.createRadialGradient(swX, swY, 20, swX, swY, 220);
  swGrad.addColorStop(0, "rgba(200,200,200,0.25)");
  swGrad.addColorStop(1, "rgba(247,247,247,0)");
  ctx.fillStyle = swGrad;
  ctx.beginPath(); ctx.ellipse(swX, swY, 220, 280, -0.3, 0, Math.PI * 2); ctx.fill();

  // Draw product image
  try {
    const prodImg = await loadImg(productImgSrc);
    const pad = 20;
    const maxW = LEFT_W - pad * 2;
    const maxH = BODY_H - pad * 2;
    const scale = Math.min(maxW / prodImg.width, maxH / prodImg.height);
    const dw = prodImg.width * scale;
    const dh = prodImg.height * scale;
    ctx.drawImage(prodImg, (LEFT_W - dw) / 2, BODY_TOP + (BODY_H - dh) / 2, dw, dh);
  } catch {
    ctx.fillStyle = "#ccc";
    ctx.font = "14px Arial"; ctx.textAlign = "center";
    ctx.fillText("Product Image", LEFT_W / 2, BODY_TOP + BODY_H / 2);
  }

  // ── 4. RIGHT PANEL ─────────────────────────────────────────────────────────
  ctx.textAlign = "left";
  let ry = BODY_TOP + 16;

  // Brand name — large, bold, stylized (red like Solingen)
  const brandSz = Math.round(W * 0.060);
  ctx.font = `900 ${brandSz}px Arial Black, Georgia, serif`;
  ctx.fillStyle = "#C41E3A";
  // Drop shadow effect
  ctx.shadowColor = "rgba(196,30,58,0.18)";
  ctx.shadowBlur = 4;
  ctx.fillText(info.brandName.toUpperCase(), RIGHT_X, ry + brandSz);
  ctx.shadowBlur = 0;
  ry += brandSz + 2;

  // Brand sub caption
  const subSz = Math.round(W * 0.017);
  ctx.font = `italic ${subSz}px Georgia, serif`;
  ctx.fillStyle = "#888";
  ctx.fillText("PROFESSIONELLE QUALITÄT", RIGHT_X, ry + subSz);
  ry += subSz + 10;

  // Thin red divider line
  ctx.strokeStyle = "#C41E3A"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(RIGHT_X, ry); ctx.lineTo(RIGHT_X + RIGHT_W, ry); ctx.stroke();
  ry += 12;

  // Product name — in a red pill/banner background (like CUTICLE NIPPER box in template)
  const boxH = Math.round(W * 0.065);
  const boxR = 6;
  // Red background box
  ctx.fillStyle = "#C41E3A";
  ctx.beginPath();
  ctx.moveTo(RIGHT_X + boxR, ry);
  ctx.lineTo(RIGHT_X + RIGHT_W - boxR, ry);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, ry, RIGHT_X + RIGHT_W, ry + boxR);
  ctx.lineTo(RIGHT_X + RIGHT_W, ry + boxH - boxR);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, ry + boxH, RIGHT_X + RIGHT_W - boxR, ry + boxH);
  ctx.lineTo(RIGHT_X + boxR, ry + boxH);
  ctx.quadraticCurveTo(RIGHT_X, ry + boxH, RIGHT_X, ry + boxH - boxR);
  ctx.lineTo(RIGHT_X, ry + boxR);
  ctx.quadraticCurveTo(RIGHT_X, ry, RIGHT_X + boxR, ry);
  ctx.closePath(); ctx.fill();

  // Product name text in the box
  const nameSz = Math.round(W * 0.036);
  ctx.font = `bold ${nameSz}px Arial`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  // Truncate to fit
  let nameText = info.productName.toUpperCase();
  while (ctx.measureText(nameText).width > RIGHT_W - 20 && nameText.length > 6) {
    nameText = nameText.slice(0, -1);
  }
  if (nameText !== info.productName.toUpperCase()) nameText += "…";
  ctx.fillText(nameText, RIGHT_X + RIGHT_W / 2, ry + boxH * 0.65);
  ctx.textAlign = "left";
  ry += boxH + 10;

  // Tagline
  const tagSz = Math.round(W * 0.022);
  ctx.font = `${tagSz}px Arial`;
  ctx.fillStyle = "#555";
  const tagShort = info.tagline.length > 42 ? info.tagline.substring(0, 42) : info.tagline;
  ctx.fillText(tagShort, RIGHT_X, ry + tagSz);
  ry += tagSz + 14;

  // ── 4 Feature rows ──
  const featSz = Math.round(W * 0.024);
  const circR = Math.round(W * 0.031);

  for (const feat of info.features.slice(0, 4)) {
    const cy = ry + circR;
    // Circle — white fill with dark border
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(RIGHT_X + circR, cy, circR, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Emoji
    ctx.font = `${Math.round(circR * 1.05)}px serif`;
    ctx.textAlign = "center"; ctx.fillStyle = "#000";
    ctx.fillText(feat.icon, RIGHT_X + circR, cy + Math.round(circR * 0.35));

    // Title bold
    ctx.textAlign = "left";
    ctx.font = `bold ${featSz}px Arial`;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillText(feat.title, RIGHT_X + circR * 2 + 10, cy - 4);

    // Subtitle small gray
    ctx.font = `${Math.round(featSz * 0.80)}px Arial`;
    ctx.fillStyle = "#888";
    ctx.fillText(feat.subtitle, RIGHT_X + circR * 2 + 10, cy + featSz - 2);

    ry += circR * 2 + 10;
  }

  // ── Price box ──────────────────────────────────────────────────────────────
  const priceBoxH = Math.round(W * 0.108);
  const priceBoxY = BODY_TOP + BODY_H - priceBoxH - 8;
  const pbR = 12;

  // Outer dark rounded rect
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.moveTo(RIGHT_X + pbR, priceBoxY);
  ctx.lineTo(RIGHT_X + RIGHT_W - pbR, priceBoxY);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, priceBoxY, RIGHT_X + RIGHT_W, priceBoxY + pbR);
  ctx.lineTo(RIGHT_X + RIGHT_W, priceBoxY + priceBoxH - pbR);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, priceBoxY + priceBoxH, RIGHT_X + RIGHT_W - pbR, priceBoxY + priceBoxH);
  ctx.lineTo(RIGHT_X + pbR, priceBoxY + priceBoxH);
  ctx.quadraticCurveTo(RIGHT_X, priceBoxY + priceBoxH, RIGHT_X, priceBoxY + priceBoxH - pbR);
  ctx.lineTo(RIGHT_X, priceBoxY + pbR);
  ctx.quadraticCurveTo(RIGHT_X, priceBoxY, RIGHT_X + pbR, priceBoxY);
  ctx.closePath(); ctx.fill();

  const priceSz = Math.round(priceBoxH * 0.68);
  ctx.font = `900 ${priceSz}px Arial Black, Arial`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(`₹${price}`, RIGHT_X + RIGHT_W / 2, priceBoxY + priceBoxH * 0.71);

  // ── 5. BOTTOM STRIP — 3 thumbnail cards ────────────────────────────────────
  const STRIP_Y = H - STRIP_H;
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, STRIP_Y, W, STRIP_H);

  ctx.strokeStyle = "#d8d8d8"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, STRIP_Y); ctx.lineTo(W, STRIP_Y); ctx.stroke();

  const thumbW = Math.round(W / 3);
  const thumbImgH = Math.round(STRIP_H * 0.62);
  const lblSz = Math.round(STRIP_H * 0.17);

  for (let i = 0; i < 3; i++) {
    const tx = i * thumbW;

    // Divider between columns
    if (i > 0) {
      ctx.strokeStyle = "#d0d0d0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tx, STRIP_Y + 8); ctx.lineTo(tx, H - 8); ctx.stroke();
    }

    // Try to draw product image as thumbnail (use same product img, just scaled)
    try {
      const tImg = await loadImg(productImgSrc);
      const tMaxW = thumbW - 16, tMaxH = thumbImgH - 8;
      const ts = Math.min(tMaxW / tImg.width, tMaxH / tImg.height);
      const tw = tImg.width * ts, th = tImg.height * ts;
      ctx.drawImage(tImg, tx + (thumbW - tw) / 2, STRIP_Y + 4 + (thumbImgH - th) / 2, tw, th);
    } catch { /* skip */ }

    // Label
    ctx.textAlign = "center";
    ctx.font = `bold ${lblSz}px Arial`;
    ctx.fillStyle = "#333333";
    ctx.fillText(
      (info.bottomLabels[i] || "").substring(0, 14),
      tx + thumbW / 2,
      STRIP_Y + thumbImgH + lblSz + 4,
    );
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CardMakerPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState("");
  const [bgRemovedSrc, setBgRemovedSrc] = useState("");
  const [price, setPrice] = useState("");
  const [aiInfo, setAiInfo] = useState<AIProductInfo | null>(null);

  const [step, setStep] = useState<"upload"|"processing"|"editing"|"done">("upload");
  const [bgStatus, setBgStatus] = useState<"pending"|"loading"|"done"|"error">("pending");
  const [aiStatus, setAiStatus] = useState<"pending"|"loading"|"done"|"error">("pending");
  const [renderingCard, setRenderingCard] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");

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
    try {
      await drawCard(canvas, headerImg, bgSrc, info, priceVal);
      setCardReady(true);
      setDownloadUrl(canvas.toDataURL("image/png", 1.0));
    } catch (e) {
      setError("Card generation failed: " + (e instanceof Error ? e.message : "unknown"));
    }
    setRenderingCard(false);
  }, [headerImg]);

  // ── Main flow ─────────────────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    setError(""); setCardReady(false); setDownloadUrl(""); setAiInfo(null);
    setBgRemovedSrc(""); setRawFile(file);
    setRawPreview(URL.createObjectURL(file));
    setStep("processing");
    setBgStatus("pending"); setAiStatus("pending");

    try {
      const { base64, mimeType } = await resizeImage(file, 1024);

      setBgStatus("loading"); setAiStatus("loading");

      const [bgSrc, info] = await Promise.all([
        removeBgHF(base64, mimeType).then((src) => { setBgStatus("done"); return src; })
          .catch(() => { setBgStatus("error"); return `data:${mimeType};base64,${base64}`; }),
        analyzeWithAI(base64, mimeType).then((i) => { setAiStatus("done"); return i; })
          .catch(() => {
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
    setRenderingCard(true);
    const info: AIProductInfo = {
      productName: editName, brandName: editBrand,
      tagline: editTagline, features: editFeatures, bottomLabels: editLabels,
    };
    await generateCard(info, bgRemovedSrc || rawPreview, price);
    setStep("done");
  };

  const reset = () => {
    if (rawPreview) URL.revokeObjectURL(rawPreview);
    setRawFile(null); setRawPreview(""); setBgRemovedSrc(""); setAiInfo(null);
    setPrice(""); setCardReady(false); setDownloadUrl(""); setError("");
    setStep("upload"); setBgStatus("pending"); setAiStatus("pending");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiImage className="text-brand-primary" /> Product Card Maker
        </h1>
        <p className="text-gray-500 text-sm mt-1">Raw photo → AI background remove → Shree Ambika branded card</p>
        <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          <FiCheck size={11} /> Hugging Face BRIA RMBG-2.0 · High quality · Free
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-5 text-sm flex gap-2 items-start">
          <FiAlertCircle size={14} className="mt-0.5 flex-shrink-0" /> {error}
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

          {/* Raw preview */}
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
                <StatusRow label="Background Remove (BRIA RMBG-2.0)" state={bgStatus} />
                <StatusRow label="AI Product Details Read kar raha hai" state={aiStatus} />
              </div>
            </div>
          )}

          {/* BG removed preview */}
          {bgRemovedSrc && bgStatus === "done" && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
              <p className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-1.5">
                <FiCheck size={13} /> Background Hata Diya ✅
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Features (4)</label>
                <div className="space-y-2">
                  {editFeatures.map((f, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <input value={f.icon}
                        onChange={(e) => { const n = [...editFeatures]; n[i] = { ...n[i], icon: e.target.value }; setEditFeatures(n); }}
                        className="w-9 border border-gray-200 rounded-lg px-1.5 py-1.5 text-sm text-center flex-shrink-0" />
                      <input value={f.title}
                        onChange={(e) => { const n = [...editFeatures]; n[i] = { ...n[i], title: e.target.value }; setEditFeatures(n); }}
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-brand-primary outline-none" />
                      <input value={f.subtitle}
                        onChange={(e) => { const n = [...editFeatures]; n[i] = { ...n[i], subtitle: e.target.value }; setEditFeatures(n); }}
                        className="w-28 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 focus:border-brand-primary outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Bottom Labels (3)</label>
                <div className="flex gap-2">
                  {(editLabels.length >= 3 ? editLabels : ["","",""]).map((l, i) => (
                    <input key={i} value={l}
                      onChange={(e) => { const nl = [...(editLabels.length >= 3 ? editLabels : ["","",""])]; nl[i] = e.target.value; setEditLabels(nl); }}
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

          {step === "processing" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Price Enter Karo (AI kaam kar raha hai) ₹</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 389"
                className="w-full border-2 border-brand-accent rounded-xl px-4 py-3 text-2xl font-black text-center focus:border-brand-primary outline-none tracking-widest" />
            </div>
          )}
        </div>

        {/* RIGHT — canvas */}
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
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[380px]">
              <canvas ref={canvasRef} className="w-full h-auto"
                style={{ maxWidth: "100%", display: cardReady ? "block" : "none" }} />
              {!cardReady && (
                <div className="text-center text-gray-300 py-16">
                  <FiImage size={44} className="mx-auto mb-3" />
                  <p className="text-sm font-medium">Card Preview</p>
                  <p className="text-xs mt-1">Photo upload → Price → Generate</p>
                </div>
              )}
            </div>
            {cardReady && (
              <div className="mt-3 p-3 bg-green-50 rounded-xl text-xs text-green-700">
                <p className="font-bold">✅ Card Ready — 780×1040px</p>
                <p>WhatsApp, Instagram, Facebook — sab jagah perfect</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, state }: { label: string; state: "pending"|"loading"|"done"|"error" }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        state === "done" ? "bg-green-100" : state === "loading" ? "bg-yellow-100" : state === "error" ? "bg-red-100" : "bg-gray-100"
      }`}>
        {state === "done" && <FiCheck size={11} className="text-green-500" />}
        {state === "loading" && <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />}
        {state === "error" && <FiX size={11} className="text-red-400" />}
        {state === "pending" && <div className="w-2 h-2 rounded-full bg-gray-300" />}
      </div>
      <span className={`text-xs ${
        state === "done" ? "text-green-600 font-semibold" : state === "loading" ? "text-yellow-600 font-semibold" : state === "error" ? "text-red-500" : "text-gray-400"
      }`}>{label}</span>
    </div>
  );
}
