"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";

const GA_ID = "G-B27MG5YKBR";

export default function GAScript({ gaId }: { gaId: string }) {
  const pathname = usePathname();

  // Do NOT fire Google Analytics on admin pages
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
