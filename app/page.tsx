import JSX from "react";
import dynamic from "next/dynamic";
import Hero from "./components/Hero";
import ScrollReveal from "./components/ScrollReveal";

const BestSellers = dynamic(() => import("./components/BestSellers"));
const NewArrivals = dynamic(() => import("./components/NewArrivals"));
const ShopByCategory = dynamic(() => import("./components/ShopByCategory"));
const FAQ = dynamic(() => import("./components/FAQ"));

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <ScrollReveal animation="up" delay={100}>
        <BestSellers />
      </ScrollReveal>
      <ScrollReveal animation="up" delay={200}>
        <NewArrivals />
      </ScrollReveal>
      <ScrollReveal animation="up" delay={300}>
        <ShopByCategory />
      </ScrollReveal>
      <ScrollReveal animation="fade" delay={300}>
        <FAQ />
      </ScrollReveal>
    </main>
  );
}

