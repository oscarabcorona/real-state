import { Mail, MessageSquare, Phone } from "lucide-react";
import { animate, inView, stagger } from "motion";
import { useEffect } from "react";
import { AnimatedElement } from "../../components/AnimatedElement";
import { FAQSection } from "./FAQSection";
import { FooterSection } from "./FooterSection";
import { HeroSection } from "./HeroSection";
import { PricingSection } from "./PrincingSection";
import { SocialProof } from "./SocialProof";
import { ValueProposition } from "./ValueProposition";

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
    <div className="bg-white">
      {/* Hero Section */}
      <HeroSection />
      {/* Value Proposition */}
      <ValueProposition />
      {/* Social Proof */}
      <SocialProof />

      {/* Pricing Section */}

      <PricingSection />

      {/* FAQ Section */}

      {/* Contact Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="slideUp">
            <div className="lg:text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Get in Touch
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Have questions? Our team is here to help
              </p>
            </div>
          </AnimatedElement>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <AnimatedElement animation="slideUp" delay={0.2}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">
                    Phone Support
                  </h3>
                </div>
                <p className="mt-4 text-gray-500">
                  Mon-Fri: 9AM - 6PM EST
                  <br />
                  +1 (555) 123-4567
                </p>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideUp" delay={0.4}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">
                    Email
                  </h3>
                </div>
                <p className="mt-4 text-gray-500">
                  support@shortstay.com
                  <br />
                  sales@shortstay.com
                </p>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideUp" delay={0.6}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">
                    Live Chat
                  </h3>
                </div>
                <p className="mt-4 text-gray-500">
                  24/7 AI Chat Support
                  <br />
                  Human Support: 9AM - 6PM EST
                </p>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
