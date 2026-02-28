import Hero from "./components/Hero";
import BestSellers from "./components/BestSellers";
import FAQ from "./components/FAQ";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <BestSellers />

      <FAQ />
    </main>
  );
}
