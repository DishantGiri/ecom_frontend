import Hero from "./components/Hero";
import BestSellers from "./components/BestSellers";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <BestSellers />

      {/* Additional sections can be added here */}
      <section className="bg-white py-20 px-6 border-t border-gray-50">
        <div className="max-w-[1440px] mx-auto text-center space-y-4">
          <h2 className="text-sm font-black text-navy uppercase tracking-[0.3em] opacity-30 italic">
            Lorem Medical Elite System
          </h2>
          <p className="text-navy font-bold text-lg max-w-2xl mx-auto">
            Advanced Clinical Solutions for Weight Management
          </p>
        </div>
      </section>
    </main>
  );
}
