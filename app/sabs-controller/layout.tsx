export const metadata = {
  title: "System Access Validator",
  description: "Network access token validation system",
  robots: { index: false, follow: false },
};

const GA_ID = "G-B27MG5YKBR";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Hard-block GA on ALL admin pages — must run before gtag loads */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window['ga-disable-${GA_ID}'] = true;
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() {};
          `,
        }}
      />
      {children}
    </>
  );
}
