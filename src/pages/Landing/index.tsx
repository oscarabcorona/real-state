import { animate, inView, stagger } from "motion";
import { useEffect } from "react";
import { FAQSection } from "./FAQSection";
import { FooterSection } from "./FooterSection";
import { HeroSection } from "./HeroSection";
import { PricingSection } from "./PricingSection";
import { SocialProof } from "./SocialProof";
import { ValueProposition } from "./ValueProposition";
import { Navbar } from "../../components/Navbar";
import { ContactSection } from "./ContactSection";

export function Landing() {
  useEffect(() => {
    // Animate stats on scroll
    const statsElements = document.querySelectorAll(".stat-number");
    statsElements.forEach((element) => {
      inView(element, () => {
        const target = element as HTMLElement;
        const value = parseInt(target.dataset.value || "0");
        animate(
          (progress) => {
            target.textContent = Math.round(progress * value).toLocaleString();
          },
          {
            duration: 1.5,
            easing: "ease-out",
          }
        );
      });
    });

    // Animate logos on scroll
    const logos = document.querySelectorAll(".company-logo");
    inView(".logos-container", () => {
      animate(
        logos,
        { opacity: [0, 1], scale: [0.8, 1] },
        { delay: stagger(0.1), duration: 0.5 }
      );
    });
  }, []);

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      <Navbar />
      <HeroSection />
      {/* Smooth scroll offset for sections */}
      <div className="scroll-mt-16" id="features">
        <ValueProposition />
      </div>
      <div className="scroll-mt-16" id="social-proof">
        <SocialProof />
      </div>
      <div className="scroll-mt-16" id="pricing">
        <PricingSection />
      </div>

      <ContactSection />

      {/* Final CTA */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
