"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetails from "@/pages/ProductDetails";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <ProductDetails slug={params.slug} />
      <Footer />
    </>
  );
}
