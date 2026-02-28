import Hero from "./components/Hero";
import BestSellers from "./components/BestSellers";
import NewArrivals from "./components/NewArrivals";
import FAQ from "./components/FAQ";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <BestSellers />
      <NewArrivals />

      <FAQ />
    </main>
  );
}
