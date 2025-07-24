import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Follow from "@/components/Follow";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <About />
      <Follow />
      <Footer />
    </div>
  );
}
