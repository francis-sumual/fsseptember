import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { RegistrationSection } from "@/components/sections/registration-section";
import { GatheringRegistrationList } from "@/components/sections/gathering-registration-list";
import { FooterSection } from "@/components/sections/footer-section";
import { FloatingNavbar } from "@/components/floating-navbar";

export default function Home() {
  return (
    <>
      <FloatingNavbar />
      <main>
        <HeroSection />
        <AboutSection />
        <RegistrationSection />
        <GatheringRegistrationList />
      </main>
      <FooterSection />
    </>
  );
}
