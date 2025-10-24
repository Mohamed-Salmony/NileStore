"use client";
import Header from "@/components/Header";
import About from "@/pages/About";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

export default function Page() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "عن Nile Store",
    url: "https://nilestore.com/about"
  };
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Header />
      <About />
      <Footer />
    </>
  );
}
