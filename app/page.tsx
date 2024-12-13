import FeaturesSection from "@/components/feactureSection";
import Header from "@/components/header";
import HeroSection from "@/components/heroSection";


export default async function Home() {
  return (
    <>
    <div>
      <Header/>
      <HeroSection/>
      <FeaturesSection/>
    </div>
    </>
  );
}
