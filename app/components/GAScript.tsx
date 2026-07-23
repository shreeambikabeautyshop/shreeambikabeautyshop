"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";

export default function GAScript({ gaId }: { gaId: string }) {
  const pathname = usePathname();

  // Extra safety — don't render on admin pages
  // Primary block is in sabs-controller/layout.tsx via window['ga-disable-*']
  if (pathname?.startsWith("/sabs-controller")) return null;

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
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
