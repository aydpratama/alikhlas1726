import { Header } from "@/components/Header";
import { RunningText } from "@/components/RunningText";
import { Hero } from "@/components/Hero";
import { FeaturedSections } from "@/components/FeaturedSections";
import { InfoSections } from "@/components/InfoSections";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <RunningText />
      <main className="flex-1 w-full max-w-[1400px] mx-auto py-8 lg:py-12 space-y-12">
        <Hero />
        <FeaturedSections />
        <InfoSections />
      </main>
      <Footer />
    </div>
  );
}
