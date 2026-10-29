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
function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

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

// Remove background via Cloudinary URL transformation
function getBgRemovedUrl(originalUrl: string): string {
  if (!originalUrl) return "";
  // Insert e_background_removal transformation before /upload/
  return originalUrl.replace("/upload/", "/upload/e_background_removal/");
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CardMakerPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState("");
  const [cloudinaryUrl, setCloudinaryUrl] = useState(""); // after upload
  const [bgRemovedUrl, setBgRemovedUrl] = useState("");   // after bg removal

  const [price, setPrice] = useState("");
  const [aiInfo, setAiInfo] = useState<AIProductInfo | null>(null);

  // Loading states
  const [uploadingImg, setUploadingImg] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [renderingCard, setRenderingCard] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "analyzing" | "editing" | "done">("upload");

  // Header image (loaded once)
  const [headerImg, setHeaderImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    // Use the existing Shree Ambika banner stored in Cloudinary
    img.src = "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png";
    img.onload = () => setHeaderImg(img);
  }, []);

  // ── Step 1: Upload raw image to Cloudinary ─────────────────────────────────
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "shreeambika_products");
    const res = await fetch("https://api.cloudinary.com/v1_1/zjlchjal/image/upload", {
      method: "POST", body: fd,
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url as string;
  };

  // ── Step 2: AI analyze product ─────────────────────────────────────────────
  const analyzeWithAI = async (file: File): Promise<AIProductInfo> => {
    const { base64, mimeType } = await resizeForAI(file);

    const res = await fetch("/api/admin/generate-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "AI failed");

    const d = json.data;

    // Map AI response to card template fields
    const benefits: string[] = Array.isArray(d.key_benefits)
      ? d.key_benefits.slice(0, 4)
      : (d.description || "").split(".").filter(Boolean).slice(0, 4).map((s: string) => s.trim());

    const featureIcons = ["💎", "✨", "🛡️", "💧"];
    const featureSubtitles = ["Premium Quality", "Fast Results", "Long Lasting", "Easy to Use"];

    const features = benefits.map((b: string, i: number) => ({
      icon: featureIcons[i] || "⭐",
      title: b.length > 30 ? b.substring(0, 30) + "..." : b,
      subtitle: featureSubtitles[i] || "",
    }));

    // Bottom labels from tags or short benefits
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

  // ── Step 3: Draw card on canvas ────────────────────────────────────────────
  const drawCard = useCallback(async (
    info: AIProductInfo,
    productImgUrl: string,
    priceVal: string,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRenderingCard(true);

    const W = 780, H = 1040;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // ── Background: white ──
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // ── Header banner (Shree Ambika) ──
    const HEADER_H = 130;
    if (headerImg) {
      ctx.drawImage(headerImg, 0, 0, W, HEADER_H);
    } else {
      // Fallback gradient header
      const hGrad = ctx.createLinearGradient(0, 0, W, 0);
      hGrad.addColorStop(0, "#C41E3A");
      hGrad.addColorStop(1, "#8B0000");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, 0, W, HEADER_H);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      ctx.fillText("श्री अंबिका ब्यूटी शॉप", W / 2, 65);
      ctx.font = "14px Arial";
      ctx.fillText("VINOD: 8291455297 | VIKRAM: 8824728350", W / 2, 95);
    }

    // ── Product image area (left side, below header) ──
    const IMG_TOP = HEADER_H + 10;
    const IMG_H = 540;
    const IMG_W = Math.round(W * 0.52);

    // Load bg-removed product image
    await new Promise<void>((resolve) => {
      const productImg = new window.Image();
      productImg.crossOrigin = "anonymous";

      productImg.onload = () => {
        // Draw on white background section
        ctx.fillStyle = "#f8f8f8";
        ctx.fillRect(0, IMG_TOP, IMG_W, IMG_H);

        // Fit image proportionally
        const scale = Math.min(IMG_W / productImg.width, IMG_H / productImg.height) * 0.9;
        const dw = productImg.width * scale;
        const dh = productImg.height * scale;
        const dx = (IMG_W - dw) / 2;
        const dy = IMG_TOP + (IMG_H - dh) / 2;
        ctx.drawImage(productImg, dx, dy, dw, dh);
        resolve();
      };
      productImg.onerror = () => {
        // Fallback: draw placeholder
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, IMG_TOP, IMG_W, IMG_H);
        ctx.fillStyle = "#ccc";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Product Image", IMG_W / 2, IMG_TOP + IMG_H / 2);
        resolve();
      };
      productImg.src = productImgUrl;
    });

    // ── Right panel ──
    const RIGHT_X = IMG_W + 15;
    const RIGHT_W = W - RIGHT_X - 15;
    const RIGHT_TOP = HEADER_H + 10;

    // Brand name
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "left";
    ctx.fillText(info.brandName.toUpperCase(), RIGHT_X, RIGHT_TOP + 35);
    ctx.font = "13px Arial";
    ctx.fillStyle = "#666";
    ctx.fillText("PROFESSIONAL", RIGHT_X, RIGHT_TOP + 55);

    // Divider
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(RIGHT_X, RIGHT_TOP + 65);
    ctx.lineTo(RIGHT_X + RIGHT_W, RIGHT_TOP + 65);
    ctx.stroke();

    // Product name (big, bold, multi-line)
    ctx.fillStyle = "#111";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "left";
    const words = info.productName.split(" ");
    let line = ""; let lineY = RIGHT_TOP + 100;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > RIGHT_W && line) {
        ctx.fillText(line.trim(), RIGHT_X, lineY);
        line = word + " "; lineY += 36;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), RIGHT_X, lineY);
    lineY += 20;

    // Tagline
    ctx.font = "15px Arial";
    ctx.fillStyle = "#555";
    ctx.fillText(info.tagline.substring(0, 38), RIGHT_X, lineY + 15);

    // Features list
    let featY = lineY + 55;
    for (const feat of info.features.slice(0, 4)) {
      // Circle icon background
      ctx.fillStyle = "#f3f4f6";
      ctx.beginPath();
      ctx.arc(RIGHT_X + 18, featY - 7, 18, 0, Math.PI * 2);
      ctx.fill();
      // Icon
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(feat.icon, RIGHT_X + 18, featY - 1);
      // Feature text
      ctx.textAlign = "left";
      ctx.font = "bold 13px Arial";
      ctx.fillStyle = "#222";
      ctx.fillText(feat.title, RIGHT_X + 44, featY - 8);
      ctx.font = "11px Arial";
      ctx.fillStyle = "#888";
      ctx.fillText(feat.subtitle, RIGHT_X + 44, featY + 7);
      featY += 46;
    }

    // ── Price box ──
    const PRICE_Y = IMG_TOP + IMG_H - 10;
    const PRICE_H = 80;

    // Black price background
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    const pr = 12;
    ctx.moveTo(RIGHT_X + pr, PRICE_Y);
    ctx.lineTo(RIGHT_X + RIGHT_W - pr, PRICE_Y);
    ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, PRICE_Y, RIGHT_X + RIGHT_W, PRICE_Y + pr);
    ctx.lineTo(RIGHT_X + RIGHT_W, PRICE_Y + PRICE_H - pr);
    ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, PRICE_Y + PRICE_H, RIGHT_X + RIGHT_W - pr, PRICE_Y + PRICE_H);
    ctx.lineTo(RIGHT_X + pr, PRICE_Y + PRICE_H);
    ctx.quadraticCurveTo(RIGHT_X, PRICE_Y + PRICE_H, RIGHT_X, PRICE_Y + PRICE_H - pr);
    ctx.lineTo(RIGHT_X, PRICE_Y + pr);
    ctx.quadraticCurveTo(RIGHT_X, PRICE_Y, RIGHT_X + pr, PRICE_Y);
    ctx.closePath();
    ctx.fill();

    // ₹ symbol + price
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`₹${priceVal}`, RIGHT_X + RIGHT_W / 2, PRICE_Y + 56);

    // ── Bottom thumbnail labels ──
    const BOT_Y = IMG_TOP + IMG_H + 15;
    const BOT_H = H - BOT_Y - 15;
    const labelW = W / 3;

    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, BOT_Y, W, BOT_H);

    // 3 bottom labels
    for (let i = 0; i < 3; i++) {
      const lx = i * labelW;
      if (i > 0) {
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, BOT_Y + 10);
        ctx.lineTo(lx, BOT_Y + BOT_H - 10);
        ctx.stroke();
      }
      ctx.fillStyle = "#444";
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "center";
      ctx.fillText(info.bottomLabels[i] || "", lx + labelW / 2, BOT_Y + BOT_H / 2 + 5);
    }

    setRenderingCard(false);
    setCardReady(true);
    setDownloadUrl(canvas.toDataURL("image/png"));
  }, [headerImg]);

  // ── Main handler: file selected ────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    setError("");
    setCardReady(false);
    setDownloadUrl("");
    setAiInfo(null);
    setCloudinaryUrl("");
    setBgRemovedUrl("");

    setRawFile(file);
    setRawPreview(URL.createObjectURL(file));
    setStep("analyzing");

    try {
      // 1. Upload to Cloudinary
      setUploadingImg(true);
      const cUrl = await uploadToCloudinary(file);
      setCloudinaryUrl(cUrl);
      setUploadingImg(false);

      // 2. Get bg-removed URL (Cloudinary AI)
      const bgUrl = getBgRemovedUrl(cUrl);
      setBgRemovedUrl(bgUrl);

      // 3. AI analyze
      setAnalyzingAI(true);
      const info = await analyzeWithAI(file);
      setAiInfo(info);
      setAnalyzingAI(false);

      setStep("editing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("upload");
      setUploadingImg(false);
      setAnalyzingAI(false);
    }
  }, []);

  // ── Generate card ──────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!aiInfo || !bgRemovedUrl || !price) return;
    setError("");
    try {
      await drawCard(aiInfo, bgRemovedUrl, price);
      setStep("done");
    } catch {
      setError("Card generation failed. Please try again.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
  };

  const reset = () => {
    if (rawPreview) URL.revokeObjectURL(rawPreview);
    setRawFile(null); setRawPreview(""); setCloudinaryUrl(""); setBgRemovedUrl("");
    setAiInfo(null); setPrice(""); setCardReady(false); setDownloadUrl(""); setError("");
    setStep("upload");
  };

  // ── Update card when ai info or price changes ──────────────────────────────
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

  const regenerateCard = async () => {
    if (!bgRemovedUrl || !price) return;
    const updated: AIProductInfo = {
      productName: editName,
      brandName: editBrand,
      tagline: editTagline,
      features: editFeatures,
      bottomLabels: editLabels,
    };
    await drawCard(updated, bgRemovedUrl, price);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiImage className="text-brand-primary" /> Product Card Maker
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload raw photo → AI reads product details → Background removed automatically → Card ready to share
        </p>
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
              <p className="font-bold text-gray-700 text-lg mb-1">Upload Product Photo</p>
              <p className="text-gray-400 text-sm">Any raw photo — hand, shelf, blister pack, box</p>
              <p className="text-gray-400 text-xs mt-2">JPG / PNG / WebP • Drag & drop or click</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
          />

          {/* Raw preview + status */}
          {rawPreview && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-gray-700">Original Photo</span>
                <button onClick={reset} className="text-gray-400 hover:text-red-500 transition-colors">
                  <FiX size={16} />
                </button>
              </div>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                <Image src={rawPreview} alt="raw" fill className="object-contain" />
              </div>

              {/* Progress steps */}
              <div className="mt-4 space-y-2">
                <StatusRow
                  label="Uploading to Cloudinary"
                  state={uploadingImg ? "loading" : cloudinaryUrl ? "done" : "pending"}
                />
                <StatusRow
                  label="Removing background (AI)"
                  state={cloudinaryUrl && !bgRemovedUrl ? "loading" : bgRemovedUrl ? "done" : "pending"}
                />
                <StatusRow
                  label="AI reading product details"
                  state={analyzingAI ? "loading" : aiInfo ? "done" : "pending"}
                />
              </div>
            </div>
          )}

          {/* BG removed preview */}
          {bgRemovedUrl && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
              <p className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1.5">
                <FiCheck className="text-green-500" /> Background Removed
              </p>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:20px_20px]">
                <Image
                  src={bgRemovedUrl}
                  alt="bg removed"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Edit panel */}
          {step === "editing" || step === "done" ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FiZap className="text-brand-primary" /> Edit Card Details
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Brand Name</label>
                  <input
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Price (₹) *</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 389"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-primary outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Product Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Tagline</label>
                <input
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Features (4)</label>
                <div className="space-y-2">
                  {editFeatures.map((f, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={f.icon}
                        onChange={(e) => {
                          const nf = [...editFeatures]; nf[i] = { ...nf[i], icon: e.target.value };
                          setEditFeatures(nf);
                        }}
                        className="w-10 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center"
                      />
                      <input
                        value={f.title}
                        onChange={(e) => {
                          const nf = [...editFeatures]; nf[i] = { ...nf[i], title: e.target.value };
                          setEditFeatures(nf);
                        }}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-brand-primary outline-none"
                      />
                      <input
                        value={f.subtitle}
                        onChange={(e) => {
                          const nf = [...editFeatures]; nf[i] = { ...nf[i], subtitle: e.target.value };
                          setEditFeatures(nf);
                        }}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 focus:border-brand-primary outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Bottom Labels (3)</label>
                <div className="flex gap-2">
                  {editLabels.map((l, i) => (
                    <input
                      key={i}
                      value={l}
                      onChange={(e) => {
                        const nl = [...editLabels]; nl[i] = e.target.value; setEditLabels(nl);
                      }}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:border-brand-primary outline-none"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!price || renderingCard}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #C41E3A, #e91e8c)" }}
              >
                {renderingCard ? (
                  <><FiRefreshCw className="animate-spin" size={16} /> Generating Card...</>
                ) : (
                  <><FiZap size={16} /> {cardReady ? "Regenerate Card" : "Generate Card"}</>
                )}
              </button>
            </div>
          ) : step === "analyzing" && !aiInfo ? (
            /* First-time price input while AI runs */
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Enter Price While AI Analyzes ₹
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 389"
                className="w-full border-2 border-brand-accent rounded-xl px-4 py-3 text-xl font-bold text-center focus:border-brand-primary outline-none"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">AI will fill other details automatically</p>
            </div>
          ) : null}
        </div>

        {/* ── RIGHT: Canvas Preview ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-gray-700">Card Preview</span>
              {cardReady && (
                <a
                  href={downloadUrl}
                  download={`${editName || "product"}-card-shreeambika.png`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all"
                  style={{ background: "#25D366" }}
                >
                  <FiDownload size={14} /> Download
                </a>
              )}
            </div>

            {/* Canvas */}
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[400px]">
              <canvas
                ref={canvasRef}
                className="w-full h-auto"
                style={{ maxWidth: "100%", display: cardReady ? "block" : "none" }}
              />
              {!cardReady && (
                <div className="text-center text-gray-300 py-20">
                  <FiImage size={48} className="mx-auto mb-3" />
                  <p className="text-sm">Card will appear here</p>
                  <p className="text-xs mt-1">Upload photo + enter price → Generate</p>
                </div>
              )}
            </div>

            {/* Share tips */}
            {cardReady && (
              <div className="mt-4 p-3 bg-green-50 rounded-xl text-xs text-green-700 space-y-1">
                <p className="font-bold">✅ Card Ready!</p>
                <p>• Download and share on WhatsApp, Instagram, Facebook</p>
                <p>• 780×1040px — perfect for all platforms</p>
                <p>• Shree Ambika branding included automatically</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Status Row Component ───────────────────────────────────────────────────────
function StatusRow({ label, state }: { label: string; state: "pending" | "loading" | "done" }) {
  return (
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
    </div>
  );
}
