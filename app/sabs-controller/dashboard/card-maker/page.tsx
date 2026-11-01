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

// ── Draw the exact Shree Ambika shop board header ────────────────────────────
function drawShopHeader(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const pad = 8;

  // ── Outer white border ──
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // ── Dark red outer frame ──
  ctx.strokeStyle = "#8B0000";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  // ── Top row: VINOD left, OM center, VIKRAM right ──
  const ROW1_H = Math.round(H * 0.195);
  // Gradient bg for top row
  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0, "#8B0000"); topGrad.addColorStop(0.5, "#C41E3A"); topGrad.addColorStop(1, "#8B0000");
  ctx.fillStyle = topGrad;
  ctx.fillRect(pad, pad, W - pad * 2, ROW1_H);

  // VINOD number (left)
  ctx.fillStyle = "#FFD700"; ctx.font = `bold ${Math.round(H * 0.085)}px Arial`;
  ctx.textAlign = "left";
  ctx.fillText("VINOD - 8291455297", pad + 10, ROW1_H * 0.65);

  // OM symbol (center)
  ctx.fillStyle = "#FFD700"; ctx.font = `bold ${Math.round(H * 0.10)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("|| ॐ ||", W / 2, ROW1_H * 0.68);

  // VIKRAM number (right)
  ctx.fillStyle = "#FFD700"; ctx.font = `bold ${Math.round(H * 0.085)}px Arial`;
  ctx.textAlign = "right";
  ctx.fillText("VIKRAM - 8824728350", W - pad - 10, ROW1_H * 0.65);

  // ── Main brand name row ──
  const BRAND_Y = ROW1_H + pad;
  const BRAND_H = Math.round(H * 0.30);

  // Background: white for main brand area
  ctx.fillStyle = "#fff";
  ctx.fillRect(pad, BRAND_Y, W - pad * 2, BRAND_H);

  // Lady silhouette placeholder (left side) — simple arc shape
  const ladyX = Math.round(W * 0.08);
  const ladyY = BRAND_Y + BRAND_H * 0.5;
  ctx.fillStyle = "#C41E3A";
  ctx.beginPath();
  ctx.arc(ladyX, ladyY, Math.round(H * 0.12), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.round(H * 0.13)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("S", ladyX, ladyY + Math.round(H * 0.045));

  // Brand name — श्री अंबिका (big, red, script-like)
  ctx.fillStyle = "#C41E3A";
  ctx.font = `900 ${Math.round(H * 0.22)}px serif`;
  ctx.textAlign = "center";
  // Shadow
  ctx.shadowColor = "rgba(139,0,0,0.3)"; ctx.shadowBlur = 3;
  ctx.fillText("श्री अंबिका", W / 2, BRAND_Y + BRAND_H * 0.68);
  ctx.shadowBlur = 0;

  // ── Sub line: ब्यूटी शॉप | रिटल वेडिंग ड्रेस ──
  const SUB_Y = BRAND_Y + BRAND_H;
  const SUB_H = Math.round(H * 0.155);

  // Blue strip for sub line
  ctx.fillStyle = "#1a3a8a";
  ctx.fillRect(pad, SUB_Y, W - pad * 2, SUB_H);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(H * 0.095)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ब्यूटी शॉप | रिटल वेडिंग ड्रेस", W / 2, SUB_Y + SUB_H * 0.72);

  // ── Bottom info bar ──
  const BOT_Y = SUB_Y + SUB_H;
  const BOT_H = H - BOT_Y - pad;

  ctx.fillStyle = "#f5f0e0";
  ctx.fillRect(pad, BOT_Y, W - pad * 2, BOT_H);

  // WHOLESALE & RETAIL (left)
  ctx.fillStyle = "#8B0000";
  ctx.font = `bold ${Math.round(H * 0.072)}px Arial`;
  ctx.textAlign = "left";
  ctx.fillText("WHOLESALE & RETAIL", pad + 8, BOT_Y + BOT_H * 0.65);

  // Address (center)
  ctx.fillStyle = "#333";
  ctx.font = `${Math.round(H * 0.053)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText("शॉप नं. 8, आकाशपुरा शॉपिंग सेंटर, दहिसर (ईस्ट), मुंबई-400066", W / 2, BOT_Y + BOT_H * 0.65);

  // FREE HOME DELIVERY (right)
  ctx.fillStyle = "#8B0000";
  ctx.font = `bold ${Math.round(H * 0.072)}px Arial`;
  ctx.textAlign = "right";
  ctx.fillText("FREE HOME DELIVERY", W - pad - 8, BOT_Y + BOT_H * 0.65);

  // Bottom border line
  ctx.strokeStyle = "#8B0000"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke();
}

// ────────────────────────────────────────────────────────────────────────────
// DRAW CARD — Premium professional template
// ────────────────────────────────────────────────────────────────────────────
async function drawCard(
  canvas: HTMLCanvasElement,
  headerImg: HTMLImageElement | null,
  productImgSrc: string,
  info: AIProductInfo,
  price: string,
) {
  const W = 780, H = 1060;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Premium warm white background ─────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#fffdf9");
  bgGrad.addColorStop(0.5, "#fff8f0");
  bgGrad.addColorStop(1, "#fdf4eb");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle diagonal texture lines (premium feel) ──────────────────────────
  ctx.strokeStyle = "rgba(196,30,58,0.04)";
  ctx.lineWidth = 1;
  for (let x = -H; x < W + H; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke();
  }

  // ── 1. HEADER — actual shop board photo ───────────────────────────────────
  const HDR_H = 150;
  const SHOP_BOARD_URL = "https://res.cloudinary.com/zjlchjal/image/upload/shop-board_ykmh85.jpg";
  try {
    const boardImg = await loadImg(SHOP_BOARD_URL);
    // Draw with rounded bottom corners using clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, HDR_H - 12);
    ctx.quadraticCurveTo(W, HDR_H, W - 12, HDR_H);
    ctx.lineTo(12, HDR_H); ctx.quadraticCurveTo(0, HDR_H, 0, HDR_H - 12);
    ctx.closePath(); ctx.clip();
    ctx.drawImage(boardImg, 0, 0, W, HDR_H);
    ctx.restore();
    // Header bottom shadow
    const hdrShadow = ctx.createLinearGradient(0, HDR_H - 8, 0, HDR_H + 10);
    hdrShadow.addColorStop(0, "rgba(0,0,0,0.12)"); hdrShadow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hdrShadow; ctx.fillRect(0, HDR_H - 8, W, 18);
  } catch {
    const hdrCanvas = document.createElement("canvas");
    hdrCanvas.width = W; hdrCanvas.height = HDR_H;
    drawShopHeader(hdrCanvas.getContext("2d")!, W, HDR_H);
    ctx.drawImage(hdrCanvas, 0, 0);
  }

  // ── 2. LAYOUT ──────────────────────────────────────────────────────────────
  const BODY_TOP = HDR_H + 14;
  const STRIP_H = 128;
  const BODY_H = H - BODY_TOP - STRIP_H;
  const LEFT_W = Math.round(W * 0.468);
  const RIGHT_X = LEFT_W + 16;
  const RIGHT_W = W - RIGHT_X - 14;

  // ── 3. LEFT — premium styled image area with SHAPE CUTOUT ──────────────────
  // Rounded rectangle with diagonal cut at bottom-right (stylish shape)
  ctx.save();
  ctx.beginPath();
  const imgR = 16; // corner radius
  ctx.moveTo(8 + imgR, BODY_TOP + 6);
  ctx.lineTo(LEFT_W - imgR, BODY_TOP + 6);
  ctx.quadraticCurveTo(LEFT_W, BODY_TOP + 6, LEFT_W, BODY_TOP + 6 + imgR);
  ctx.lineTo(LEFT_W, BODY_TOP + BODY_H - 40); // diagonal cut start
  ctx.lineTo(LEFT_W - 40, BODY_TOP + BODY_H - 6); // diagonal cut
  ctx.lineTo(8 + imgR, BODY_TOP + BODY_H - 6);
  ctx.quadraticCurveTo(8, BODY_TOP + BODY_H - 6, 8, BODY_TOP + BODY_H - 6 - imgR);
  ctx.lineTo(8, BODY_TOP + 6 + imgR);
  ctx.quadraticCurveTo(8, BODY_TOP + 6, 8 + imgR, BODY_TOP + 6);
  ctx.closePath();

  // Premium gradient fill for image background
  const imgBg = ctx.createLinearGradient(8, BODY_TOP, LEFT_W, BODY_TOP + BODY_H);
  imgBg.addColorStop(0, "#f0f4ff");
  imgBg.addColorStop(0.4, "#e8f0fe");
  imgBg.addColorStop(1, "#dde8f8");
  ctx.fillStyle = imgBg;
  ctx.fill();

  // Subtle inner glow
  const innerGlow = ctx.createRadialGradient(LEFT_W * 0.5, BODY_TOP + BODY_H * 0.4, 30, LEFT_W * 0.5, BODY_TOP + BODY_H * 0.4, 200);
  innerGlow.addColorStop(0, "rgba(255,255,255,0.7)");
  innerGlow.addColorStop(1, "rgba(200,220,255,0)");
  ctx.fillStyle = innerGlow; ctx.fill();

  // Clip product image to shape
  ctx.beginPath();
  ctx.moveTo(8 + imgR, BODY_TOP + 6);
  ctx.lineTo(LEFT_W - imgR, BODY_TOP + 6);
  ctx.quadraticCurveTo(LEFT_W, BODY_TOP + 6, LEFT_W, BODY_TOP + 6 + imgR);
  ctx.lineTo(LEFT_W, BODY_TOP + BODY_H - 40);
  ctx.lineTo(LEFT_W - 40, BODY_TOP + BODY_H - 6);
  ctx.lineTo(8 + imgR, BODY_TOP + BODY_H - 6);
  ctx.quadraticCurveTo(8, BODY_TOP + BODY_H - 6, 8, BODY_TOP + BODY_H - 6 - imgR);
  ctx.lineTo(8, BODY_TOP + 6 + imgR);
  ctx.quadraticCurveTo(8, BODY_TOP + 6, 8 + imgR, BODY_TOP + 6);
  ctx.closePath();
  ctx.clip();

  // Draw product image
  try {
    const prodImg = await loadImg(productImgSrc);
    const pad = 24;
    const maxW = LEFT_W - pad * 2;
    const maxH = BODY_H - pad * 2;
    const scale = Math.min(maxW / prodImg.width, maxH / prodImg.height);
    const dw = prodImg.width * scale, dh = prodImg.height * scale;
    ctx.drawImage(prodImg, (LEFT_W - dw) / 2, BODY_TOP + (BODY_H - dh) / 2, dw, dh);
  } catch { /* skip */ }
  ctx.restore();

  // Shape border stroke (premium gold/red accent)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(8 + imgR, BODY_TOP + 6);
  ctx.lineTo(LEFT_W - imgR, BODY_TOP + 6);
  ctx.quadraticCurveTo(LEFT_W, BODY_TOP + 6, LEFT_W, BODY_TOP + 6 + imgR);
  ctx.lineTo(LEFT_W, BODY_TOP + BODY_H - 40);
  ctx.lineTo(LEFT_W - 40, BODY_TOP + BODY_H - 6);
  ctx.lineTo(8 + imgR, BODY_TOP + BODY_H - 6);
  ctx.quadraticCurveTo(8, BODY_TOP + BODY_H - 6, 8, BODY_TOP + BODY_H - 6 - imgR);
  ctx.lineTo(8, BODY_TOP + 6 + imgR);
  ctx.quadraticCurveTo(8, BODY_TOP + 6, 8 + imgR, BODY_TOP + 6);
  ctx.closePath();
  ctx.strokeStyle = "rgba(196,30,58,0.35)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();

  // ── 4. RIGHT PANEL ─────────────────────────────────────────────────────────
  ctx.textAlign = "left";
  let ry = BODY_TOP + 14;

  // ── Brand name — large, bold, red, serif (Solingen style) ──────────────────
  const brandSz = Math.round(W * 0.063);
  ctx.font = `900 ${brandSz}px Georgia, serif`;
  ctx.fillStyle = "#B01C32";
  ctx.shadowColor = "rgba(176,28,50,0.20)"; ctx.shadowBlur = 5; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 2;
  ctx.fillText(info.brandName, RIGHT_X, ry + brandSz);
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  ry += brandSz + 2;

  // Brand tagline small (italic gray)
  const subSz = Math.round(W * 0.018);
  ctx.font = `italic ${subSz}px Georgia, serif`;
  ctx.fillStyle = "#999";
  ctx.fillText("Professional Quality · Est. 2001", RIGHT_X, ry + subSz);
  ry += subSz + 10;

  // Decorative divider — gold line with diamond
  const divY = ry + 3;
  const goldGrad = ctx.createLinearGradient(RIGHT_X, 0, RIGHT_X + RIGHT_W, 0);
  goldGrad.addColorStop(0, "rgba(180,140,50,0)");
  goldGrad.addColorStop(0.1, "#c8a84b");
  goldGrad.addColorStop(0.5, "#e8c860");
  goldGrad.addColorStop(0.9, "#c8a84b");
  goldGrad.addColorStop(1, "rgba(180,140,50,0)");
  ctx.strokeStyle = goldGrad; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(RIGHT_X, divY); ctx.lineTo(RIGHT_X + RIGHT_W, divY); ctx.stroke();
  // Diamond at center
  const dCx = RIGHT_X + RIGHT_W / 2;
  ctx.fillStyle = "#e8c860";
  ctx.beginPath(); ctx.moveTo(dCx, divY - 5); ctx.lineTo(dCx + 5, divY); ctx.lineTo(dCx, divY + 5); ctx.lineTo(dCx - 5, divY); ctx.closePath(); ctx.fill();
  ry += 16;

  // ── Product name — gradient red pill box ────────────────────────────────────
  const boxH = Math.round(W * 0.062);
  const boxR = 8;
  const boxGrad = ctx.createLinearGradient(RIGHT_X, ry, RIGHT_X + RIGHT_W, ry + boxH);
  boxGrad.addColorStop(0, "#C41E3A"); boxGrad.addColorStop(1, "#8B0000");
  ctx.fillStyle = boxGrad;
  // Rounded rect
  ctx.beginPath();
  ctx.moveTo(RIGHT_X + boxR, ry); ctx.lineTo(RIGHT_X + RIGHT_W - boxR, ry);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, ry, RIGHT_X + RIGHT_W, ry + boxR);
  ctx.lineTo(RIGHT_X + RIGHT_W, ry + boxH - boxR);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, ry + boxH, RIGHT_X + RIGHT_W - boxR, ry + boxH);
  ctx.lineTo(RIGHT_X + boxR, ry + boxH);
  ctx.quadraticCurveTo(RIGHT_X, ry + boxH, RIGHT_X, ry + boxH - boxR);
  ctx.lineTo(RIGHT_X, ry + boxR);
  ctx.quadraticCurveTo(RIGHT_X, ry, RIGHT_X + boxR, ry);
  ctx.closePath(); ctx.fill();
  // Inner highlight line
  ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(RIGHT_X + boxR + 4, ry + 3); ctx.lineTo(RIGHT_X + RIGHT_W - boxR - 4, ry + 3); ctx.stroke();

  // Product name text
  const nameSz = Math.round(W * 0.032);
  ctx.font = `bold ${nameSz}px Arial, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  let nameText = info.productName.toUpperCase();
  // Fit text
  while (ctx.measureText(nameText).width > RIGHT_W - 20 && nameText.length > 6) nameText = nameText.slice(0, -1);
  if (nameText !== info.productName.toUpperCase()) nameText += "…";
  ctx.fillText(nameText, RIGHT_X + RIGHT_W / 2, ry + boxH * 0.67);
  ctx.textAlign = "left";
  ry += boxH + 10;

  // ── Tagline ──────────────────────────────────────────────────────────────────
  const tagSz = Math.round(W * 0.021);
  ctx.font = `${tagSz}px Georgia, serif`;
  ctx.fillStyle = "#666";
  const tag = info.tagline.length > 44 ? info.tagline.substring(0, 44) : info.tagline;
  ctx.fillText(tag, RIGHT_X, ry + tagSz);
  ry += tagSz + 14;

  // ── 4 Feature rows — premium style ──────────────────────────────────────────
  const featSz = Math.round(W * 0.0235);
  const circR = Math.round(W * 0.029);

  for (const feat of info.features.slice(0, 4)) {
    const cy = ry + circR;

    // Circle with gradient fill
    const circGrad = ctx.createRadialGradient(RIGHT_X + circR - 3, cy - 3, 2, RIGHT_X + circR, cy, circR);
    circGrad.addColorStop(0, "#ffffff"); circGrad.addColorStop(1, "#f0e8f0");
    ctx.fillStyle = circGrad;
    ctx.strokeStyle = "#ddc8cc"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(RIGHT_X + circR, cy, circR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Emoji icon
    ctx.font = `${Math.round(circR * 1.0)}px serif`;
    ctx.textAlign = "center"; ctx.fillStyle = "#000";
    ctx.fillText(feat.icon, RIGHT_X + circR, cy + Math.round(circR * 0.35));

    // Feature title — bold dark
    ctx.textAlign = "left";
    ctx.font = `bold ${featSz}px Arial, sans-serif`;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillText(feat.title, RIGHT_X + circR * 2 + 10, cy - 4);

    // Feature subtitle — italic light gray
    ctx.font = `italic ${Math.round(featSz * 0.78)}px Georgia, serif`;
    ctx.fillStyle = "#aaa";
    ctx.fillText(feat.subtitle, RIGHT_X + circR * 2 + 10, cy + featSz - 2);

    // Tiny dot separator
    ctx.fillStyle = "#e0c8c8";
    ctx.beginPath(); ctx.arc(RIGHT_X + circR * 2 + 5, cy + 3, 1.5, 0, Math.PI * 2); ctx.fill();

    ry += circR * 2 + 9;
  }

  // ── Price box — premium dark with gold accent ─────────────────────────────
  const priceBoxH = Math.round(W * 0.104);
  const priceBoxY = BODY_TOP + BODY_H - priceBoxH - 10;
  const pbR = 14;
  const priceGrad = ctx.createLinearGradient(RIGHT_X, priceBoxY, RIGHT_X + RIGHT_W, priceBoxY + priceBoxH);
  priceGrad.addColorStop(0, "#1a1a2e"); priceGrad.addColorStop(1, "#0d0d1a");
  ctx.fillStyle = priceGrad;
  ctx.beginPath();
  ctx.moveTo(RIGHT_X + pbR, priceBoxY); ctx.lineTo(RIGHT_X + RIGHT_W - pbR, priceBoxY);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, priceBoxY, RIGHT_X + RIGHT_W, priceBoxY + pbR);
  ctx.lineTo(RIGHT_X + RIGHT_W, priceBoxY + priceBoxH - pbR);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, priceBoxY + priceBoxH, RIGHT_X + RIGHT_W - pbR, priceBoxY + priceBoxH);
  ctx.lineTo(RIGHT_X + pbR, priceBoxY + priceBoxH);
  ctx.quadraticCurveTo(RIGHT_X, priceBoxY + priceBoxH, RIGHT_X, priceBoxY + priceBoxH - pbR);
  ctx.lineTo(RIGHT_X, priceBoxY + pbR);
  ctx.quadraticCurveTo(RIGHT_X, priceBoxY, RIGHT_X + pbR, priceBoxY);
  ctx.closePath(); ctx.fill();

  // Gold border on price box
  ctx.strokeStyle = "#c8a84b"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(RIGHT_X + pbR, priceBoxY); ctx.lineTo(RIGHT_X + RIGHT_W - pbR, priceBoxY);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, priceBoxY, RIGHT_X + RIGHT_W, priceBoxY + pbR);
  ctx.lineTo(RIGHT_X + RIGHT_W, priceBoxY + priceBoxH - pbR);
  ctx.quadraticCurveTo(RIGHT_X + RIGHT_W, priceBoxY + priceBoxH, RIGHT_X + RIGHT_W - pbR, priceBoxY + priceBoxH);
  ctx.lineTo(RIGHT_X + pbR, priceBoxY + priceBoxH);
  ctx.quadraticCurveTo(RIGHT_X, priceBoxY + priceBoxH, RIGHT_X, priceBoxY + priceBoxH - pbR);
  ctx.lineTo(RIGHT_X, priceBoxY + pbR);
  ctx.quadraticCurveTo(RIGHT_X, priceBoxY, RIGHT_X + pbR, priceBoxY);
  ctx.closePath(); ctx.stroke();

  // ₹ symbol small
  const rupeeSz = Math.round(priceBoxH * 0.32);
  ctx.font = `bold ${rupeeSz}px Arial`;
  ctx.fillStyle = "#c8a84b";
  ctx.textAlign = "left";
  ctx.fillText("₹", RIGHT_X + 14, priceBoxY + priceBoxH * 0.68);

  // Price number big white
  const priceSz = Math.round(priceBoxH * 0.66);
  ctx.font = `900 ${priceSz}px Arial Black, Arial`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(price, RIGHT_X + RIGHT_W / 2 + 12, priceBoxY + priceBoxH * 0.72);

  // ── 5. BOTTOM — "How to Use" premium strip ────────────────────────────────
  const STRIP_Y = H - STRIP_H;

  // Gradient background
  const stripGrad = ctx.createLinearGradient(0, STRIP_Y, 0, H);
  stripGrad.addColorStop(0, "#1a1a2e"); stripGrad.addColorStop(1, "#2d1a2e");
  ctx.fillStyle = stripGrad;
  ctx.fillRect(0, STRIP_Y, W, STRIP_H);

  // Gold top border
  ctx.strokeStyle = "#c8a84b"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, STRIP_Y + 1); ctx.lineTo(W, STRIP_Y + 1); ctx.stroke();

  // HOW TO USE header
  const htuBarH = Math.round(STRIP_H * 0.27);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(htuBarH * 0.56)}px Arial`;
  ctx.textAlign = "center";
  // Letter spacing effect
  const htuText = "✦  HOW TO USE  ✦";
  ctx.fillText(htuText, W / 2, STRIP_Y + htuBarH * 0.80);

  // Gold underline
  ctx.strokeStyle = "#c8a84b"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W * 0.2, STRIP_Y + htuBarH); ctx.lineTo(W * 0.8, STRIP_Y + htuBarH); ctx.stroke();

  // 3 step columns
  const colW = Math.round(W / 3);
  const steps = info.bottomLabels.length >= 3 ? info.bottomLabels : ["Apply Product", "Wait & Absorb", "See Results"];
  const stepY = STRIP_Y + htuBarH + 6;
  const stepH = H - stepY - 6;
  const circleR2 = Math.round(stepH * 0.22);
  const stepFontSz = Math.round(stepH * 0.16);

  for (let i = 0; i < 3; i++) {
    const cx = i * colW + colW / 2;

    // Vertical dividers
    if (i > 0) {
      ctx.strokeStyle = "rgba(200,168,75,0.3)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(i * colW, stepY + 4); ctx.lineTo(i * colW, H - 6); ctx.stroke();
    }

    // Step number circle — gold gradient
    const scy = stepY + circleR2 + 4;
    const circleGrad = ctx.createRadialGradient(cx, scy, 2, cx, scy, circleR2);
    circleGrad.addColorStop(0, "#f0d070"); circleGrad.addColorStop(1, "#c8a84b");
    ctx.fillStyle = circleGrad;
    ctx.beginPath(); ctx.arc(cx, scy, circleR2, 0, Math.PI * 2); ctx.fill();

    // Step number
    ctx.fillStyle = "#1a1a2e";
    ctx.font = `900 ${Math.round(circleR2 * 1.05)}px Arial Black, Arial`;
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), cx, scy + Math.round(circleR2 * 0.38));

    // Step text
    ctx.fillStyle = "#e8e8e8";
    ctx.font = `bold ${stepFontSz}px Arial`;
    ctx.fillText((steps[i] || "").substring(0, 14), cx, stepY + stepH - 4);
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

  // Preload no longer needed — shop board loaded directly in drawCard
  // keeping state for backwards compatibility
  const [headerImg] = useState<HTMLImageElement | null>(null);

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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">How to Use (3 Steps)</label>
                <div className="flex gap-2">
                  {(editLabels.length >= 3 ? editLabels : ["","",""]).map((l, i) => (
                    <input key={i} value={l}
                      placeholder={`Step ${i + 1}`}
                      onChange={(e) => { const nl = [...(editLabels.length >= 3 ? editLabels : ["","",""])]; nl[i] = e.target.value; setEditLabels(nl); }}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:border-brand-primary outline-none" />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">e.g. "Clean Nails" · "Apply Pressure" · "Remove Cuticle"</p>
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
