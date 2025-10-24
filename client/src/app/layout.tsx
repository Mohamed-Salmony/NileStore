import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "متجر النيل - Nile Store | تسوق أفضل المنتجات بأسعار تنافسية",
  description:
    "متجر النيل - وجهتك المفضلة للتسوق عبر الإنترنت في مصر. اكتشف مجموعة واسعة من المنتجات عالية الجودة بأسعار تنافسية مع توصيل سريع وآمن",
  metadataBase: new URL("https://nilestore.com"),
  alternates: {
    canonical: "/",
    languages: {
      ar: "/",
      en: "/en",
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "متجر النيل - Nile Store | أفضل متجر إلكتروني في مصر",
    description:
      "تسوق من مجموعة واسعة من المنتجات الأصلية بأفضل الأسعار مع شحن سريع وآمن",
    type: "website",
    url: "https://nilestore.com",
    images: ["https://nilestore.com/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "متجر النيل - Nile Store",
    description: "تسوق أفضل المنتجات بأسعار تنافسية",
    images: ["https://nilestore.com/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nile Store",
    url: "https://nilestore.com",
    logo: "/favicon.ico",
    sameAs: [
      "https://www.facebook.com/nilestore",
      "https://www.instagram.com/nilestore",
      "https://x.com/nilestore"
    ]
  };

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="overflow-x-hidden">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} 
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
