import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Follow from "@/components/Follow";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Hero />
      <Follow />
    </div>
  );
}
