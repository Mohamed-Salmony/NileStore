"use client";
import Header from "@/components/Header";
import Contact from "@/pages/Contact";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

export default function Page() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "تواصل معنا - Nile Store",
    url: "https://nilestore.com/contact"
  };
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Header />
      <Contact />
      <Footer />
    </>
  );
}
