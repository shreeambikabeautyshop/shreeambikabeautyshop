/**
 * cloudinary-img.ts
 *
 * Transforms Cloudinary image URLs to include automatic optimization params:
 *   f_auto  — serve WebP to Chrome, AVIF where supported, JPEG fallback
 *   q_auto  — auto quality (Cloudinary's perceptual quality algorithm)
 *   w_{n}   — resize to requested width
 *   c_limit — never upscale (limit mode)
 *
 * WHY: We disabled Vercel's Next.js image optimizer (unoptimized:true in next.config.js)
 * to avoid burning through Vercel free plan's 100K cache writes/month.
 * Cloudinary handles optimization natively — same quality, zero Vercel quota usage.
 *
 * Usage:
 *   import { cldImg } from "@/app/lib/cloudinary-img"
 *   <img src={cldImg(url, 400)} alt="..." />
 *   <img src={cldImg(url, 800)} alt="..." />
 */

const CLOUDINARY_BASE = "https://res.cloudinary.com/zjlchjal/image/upload";

/**
 * Returns an optimized Cloudinary image URL.
 * @param url   - Original Cloudinary URL
 * @param width - Desired width in pixels (default: 800)
 */
export function cldImg(url: string | null | undefined, width = 800): string {
  if (!url) return "";

  // Already a Cloudinary URL — inject transformations
  if (url.includes("res.cloudinary.com")) {
    // Insert f_auto,q_auto,w_{width},c_limit after /upload/
    return url.replace(
      /\/upload\/(v\d+\/)?/,
      `/upload/f_auto,q_auto:good,w_${width},c_limit/$1`
    );
  }

  // Not a Cloudinary URL — return as-is
  return url;
}

/**
 * Returns a srcSet string for responsive images via Cloudinary.
 * @param url    - Original Cloudinary URL
 * @param widths - Array of widths to generate (default: common breakpoints)
 */
export function cldSrcSet(
  url: string | null | undefined,
  widths: number[] = [320, 480, 640, 800, 1200]
): string {
  if (!url) return "";
  return widths.map((w) => `${cldImg(url, w)} ${w}w`).join(", ");
}

/**
 * Thumbnail helper — small size for list views, admin panel etc.
 */
export function cldThumb(url: string | null | undefined, size = 96): string {
  return cldImg(url, size);
}
