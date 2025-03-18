import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Rocket,
} from "lucide-react";
import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { AnimatedNumber } from "../../components/animated/AnimatedNumber";
import { AnimatedText } from "../../components/animated/AnimatedText";
import { useEffect, useRef, useState } from "react";

export function HeroSection() {
  const heroRef = useRef<HTMLImageElement>(null);
  const [scrollIndicator, setScrollIndicator] = useState(true);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrolled = window.scrollY;
      heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      heroRef.current.style.opacity = `${1 - scrolled / 700}`;

      // Hide scroll indicator after scrolling
      if (scrolled > 100) {
        setScrollIndicator(false);
      } else {
        setScrollIndicator(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background with improved gradient */}
      <div className="absolute inset-0">
        <img
          ref={heroRef}
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80"
          alt="Modern building"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-background/90 dark:from-primary/80 dark:via-primary/70 dark:to-background/95" />

        {/* Enhanced floating elements with better animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute size-[30rem] -top-48 -left-48 bg-primary/15 dark:bg-primary/10 rounded-full blur-3xl animate-slow-pulse" />
          <div className="absolute size-[35rem] top-1/2 -right-48 bg-secondary/15 dark:bg-secondary/10 rounded-full blur-3xl animate-slow-pulse animation-delay-2000" />
          <div className="absolute size-[25rem] -bottom-48 left-1/3 bg-accent/15 dark:bg-accent/10 rounded-full blur-3xl animate-slow-pulse animation-delay-4000" />
        </div>
      </div>

      {/* Content */}
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full max-w-7xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6 relative z-10">
            {/* Main content with improved typography */}
            <AnimatedElement animation="slideUp" delay={0.2}>
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6 border border-white/20">
                <BrainCircuit className="size-4 text-indigo-200" />
                <span className="text-white/90 font-medium text-sm">
                  AI-Powered Property Management
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block text-white">
                  <AnimatedText text="Smart Property" delay={0.5} />
                </span>
                <AnimatedText
                  text="Management, Simplified"
                  delay={0.8}
                  className="text-accent text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl"
                />
              </h1>
            </AnimatedElement>

            {/* Subtitle section - replacing the feature list */}
            <AnimatedElement animation="slideUp" delay={1}>
              <p className="mt-4 text-xl leading-relaxed text-indigo-100 max-w-2xl">
                Experience the future of property management. Our AI-driven
                platform reduces costs by 40%, automates daily tasks, and
                provides real-time insights for better decision-making.
              </p>
            </AnimatedElement>

            {/* Enhanced CTA Section */}
            <AnimatedElement animation="slideUp" delay={1.2}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="group bg-white hover:bg-white/90 text-primary font-medium px-6 py-6 h-auto transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  asChild
                >
                  <Link to="/login">
                    <span>Start Free Trial</span>
                    <Rocket className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="group border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/15 hover:border-white/50 px-6 py-6 h-auto transition-all duration-300"
                    >
                      <PlayCircle className="mr-2" />
                      <span>Watch Demo</span>
                      <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl p-1 bg-background/95 backdrop-blur-md">
                    <div className="aspect-video rounded-md overflow-hidden">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/your-video-id"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </AnimatedElement>

            {/* Enhanced Stats with better design */}
            <div className="mt-14 grid grid-cols-3 gap-4 max-w-2xl">
              <AnimatedElement animation="scale" delay={1.4}>
                <div className="flex flex-col items-center p-4 bg-white/10 dark:bg-white/5 rounded-xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-colors">
                  <AnimatedNumber
                    value={98}
                    suffix="%"
                    className="text-3xl font-bold text-white dark:text-white/90"
                  />
                  <span className="mt-1 text-sm text-indigo-200 dark:text-indigo-300 font-medium">
                    Client Satisfaction
                  </span>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="scale" delay={1.6}>
                <div className="flex flex-col items-center p-4 bg-white/10 dark:bg-white/5 rounded-xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-colors">
                  <AnimatedNumber
                    value={75000}
                    suffix="+"
                    className="text-3xl font-bold text-white dark:text-white/90"
                  />
                  <span className="mt-1 text-sm text-indigo-200 dark:text-indigo-300 font-medium">
                    Units Managed
                  </span>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="scale" delay={1.8}>
                <div className="flex flex-col items-center p-4 bg-white/10 dark:bg-white/5 rounded-xl backdrop-blur-sm border border-white/20 hover:border-white/40 transition-colors">
                  <AnimatedNumber
                    value={40}
                    suffix="%"
                    className="text-3xl font-bold text-white dark:text-white/90"
                  />
                  <span className="mt-1 text-sm text-indigo-200 dark:text-indigo-300 font-medium">
                    Cost Reduction
                  </span>
                </div>
              </AnimatedElement>
            </div>
          </div>

          {/* Right side preview/mockup */}
          <div className="hidden lg:block lg:col-span-6 lg:flex lg:items-center">
            <AnimatedElement animation="slideUp" delay={0.5}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 shadow-2xl">
                  <img
                    src="/mockup.png"
                    alt="App preview"
                    className="rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/800x600/primary/white?text=Property+Management+App";
                    }}
                  />
                  <div className="absolute -bottom-6 -right-6 size-24 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="absolute -top-6 -left-6 size-24 bg-white/20 rounded-full blur-2xl"></div>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </div>

      {/* Scroll indicator - fixed the animation type */}
      {scrollIndicator && (
        <AnimatedElement animation="fadeIn" delay={2}>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/70 cursor-pointer">
            <span className="text-sm font-medium mb-2">Scroll to explore</span>
            <ChevronDown className="animate-bounce" />
          </div>
        </AnimatedElement>
      )}
    </div>
  );
}
