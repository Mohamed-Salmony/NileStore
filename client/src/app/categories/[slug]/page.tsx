"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryProducts from "@/pages/CategoryProducts";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <CategoryProducts slug={params.slug} />
      <Footer />
    </>
  );
}
