"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";

export default function GAScript({ gaId }: { gaId: string }) {
  const pathname = usePathname();

  // Block GA on all admin/internal pages
  if (pathname?.startsWith("/sabs-controller")) return null;
  if (pathname?.startsWith("/api/")) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            send_page_view: true,
            cookie_flags: 'SameSite=None;Secure',
            custom_map: {
              'dimension1': 'page_type'
            }
          });
          // Track page type for segmentation
          var path = window.location.pathname;
          var pageType = 'other';
          if (path === '/') pageType = 'home';
          else if (path.startsWith('/products/')) pageType = 'product';
          else if (path.startsWith('/categories/')) pageType = 'category';
          else if (path.startsWith('/blog/')) pageType = 'blog';
          else if (path.startsWith('/occasions/')) pageType = 'occasion';
          else if (path.startsWith('/beauty-tips/')) pageType = 'beauty_tips';
          else if (path === '/products') pageType = 'product_listing';
          gtag('event', 'page_view', { page_type: pageType });
        `}
      </Script>
    </>
  );
}
