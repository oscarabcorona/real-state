import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronRight, PlayCircle, Rocket } from "lucide-react";
import { AnimatedElement } from "../../components/AnimatedElement";
import { AnimatedNumber } from "../../components/AnimatedNumber";
import { AnimatedText } from "../../components/AnimatedText";
import { useEffect, useRef } from "react";

export function HeroSection() {
  const heroRef = useRef<HTMLImageElement>(null);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrolled = window.scrollY;
      heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      heroRef.current.style.opacity = `${1 - scrolled / 700}`;
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
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1973&q=80"
          alt="Modern building"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-background/95 dark:from-primary/70 dark:via-primary/60 dark:to-background/90" />

        {/* Floating Elements with improved dark mode opacity */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute size-96 -top-48 -left-48 bg-primary/20 dark:bg-primary/5 rounded-full blur-3xl animate-blob" />
          <div className="absolute size-96 top-1/2 -right-48 bg-secondary/20 dark:bg-secondary/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute size-96 -bottom-48 left-1/2 bg-accent/20 dark:bg-accent/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Content */}
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full max-w-7xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 relative z-10">
            {/* Main content */}
            <AnimatedElement animation="slideUp" delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <AnimatedText text="Smart Property" delay={0.5} />
                <span className="block text-indigo-200">
                  <AnimatedText text="Management, Simplified" delay={0.8} />
                </span>
              </h1>
            </AnimatedElement>

            <AnimatedElement animation="slideUp" delay={1}>
              <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
                Experience the future of property management. Our AI-driven
                platform reduces costs by 40%, automates daily tasks, and
                provides real-time insights for better decision-making.
              </p>
            </AnimatedElement>

            {/* CTA Section with improved buttons */}
            <AnimatedElement animation="slideUp" delay={1.2}>
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="group bg-background/10 hover:bg-background/20 text-white dark:bg-background/5 dark:hover:bg-background/15"
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
                      className="group border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                      <PlayCircle className="mr-2" />
                      <span>Watch Demo</span>
                      <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <div className="aspect-video">
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

            {/* Stats with improved design */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <AnimatedElement animation="scale" delay={1.4}>
                <div className="flex flex-col items-center p-3 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
                  <AnimatedNumber
                    value={98}
                    suffix="%"
                    className="text-3xl font-bold text-white dark:text-white/90"
                  />
                  <span className="text-sm text-indigo-200 dark:text-indigo-300">
                    Client Satisfaction
                  </span>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="scale" delay={1.6}>
                <div className="flex flex-col items-center p-3 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
                  <AnimatedNumber
                    value={75000}
                    suffix="+"
                    className="text-3xl font-bold text-white dark:text-white/90"
                  />
                  <span className="text-sm text-indigo-200 dark:text-indigo-300">
                    Units Managed
                  </span>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="scale" delay={1.8}>
                <div className="flex flex-col items-center p-3 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
                  <AnimatedNumber
                    value={40}
                    suffix="%"
                    className="text-3xl font-bold text-white dark:text-white/90"
                  />
                  <span className="text-sm text-indigo-200 dark:text-indigo-300">
                    Cost Reduction
                  </span>
                </div>
              </AnimatedElement>
            </div>
          </div>

          {/* New: Right side preview/mockup */}
          {/* <div className="hidden lg:col-span-5 lg:flex lg:items-center">
            <AnimatedElement animation="slideUp" delay={0.5}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-2xl blur" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
                  <img
                    src="/mockup.png"
                    alt="App preview"
                    className="rounded-xl shadow-2xl"
                  />
                </div>
              </div>
            </AnimatedElement>
          </div> */}
        </div>
      </div>
    </div>
  );
}
