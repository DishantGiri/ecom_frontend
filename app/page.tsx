import JSX from "react";
import Hero from "./components/Hero";
import ShopByCategory from "./components/ShopByCategory";
import BestSellers from "./components/BestSellers";
import NewArrivals from "./components/NewArrivals";
import FAQ from "./components/FAQ";
import ScrollReveal from "./components/ScrollReveal";

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

