import { animate, inView, spring } from "motion";
import { Star, Award, ChartBar, Building, Quote } from "lucide-react";
import { useEffect, useRef } from "react";
import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { AnimatedNumber } from "../../components/animated/AnimatedNumber";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const testimonials = [
  {
    name: "Sarah Wilson",
    role: "Director of Operations",
    company: "PropertyCo",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote:
      "We increased our annual revenue by $287,000 and cut operational costs by 35% within just 6 months. The tenant satisfaction scores jumped from 72% to 94%. This platform has completely transformed how we manage our 1,200+ units.",
  },
  {
    name: "Tom Anderson",
    role: "Real Estate Investor",
    company: "Anderson Properties",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote:
      "I was skeptical at first, but the ROI was almost immediate. The automated compliance checks saved us $45,000 in potential legal fees in the first year alone. Now I can manage twice as many properties with half the staff.",
  },
  {
    name: "Emily Chen",
    role: "Property Manager",
    company: "Urban Living",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote:
      "Tenant screening used to take us 3 days per applicant. Now it's 20 minutes with 200% more accuracy. We've reduced vacancy rates by 64% and bad tenant situations are virtually non-existent. Worth every penny.",
  },
];

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  image: string;
  quote: string;
  delay: number;
}

function TestimonialCard({
  name,
  role,
  company,
  image,
  quote,
  delay,
}: TestimonialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const element = cardRef.current;
    element.addEventListener("mouseenter", () => {
      animate(
        element,
        { y: -5, scale: 1.01 },
        { duration: 0.2, easing: spring() }
      );
    });

    element.addEventListener("mouseleave", () => {
      animate(element, { y: 0, scale: 1 }, { duration: 0.2, easing: spring() });
    });
  }, []);

  return (
    <AnimatedElement animation="slideUp" delay={delay}>
      <div
        ref={cardRef}
        className="relative h-full bg-card dark:bg-card/80 p-8 rounded-2xl shadow-lg transition-all duration-300 border border-transparent hover:border-primary/10 group"
      >
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent dark:from-primary/10 dark:to-transparent rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quote icon */}
        <div className="absolute -top-3 -right-3 h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Quote className="h-6 w-6 text-primary rotate-180" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 blur-sm group-hover:blur-md transition-all duration-300" />
              <img
                className="relative h-16 w-16 rounded-full object-cover border-2 border-white dark:border-gray-800"
                src={image}
                alt={name}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground">{name}</h4>
              <p className="text-sm text-primary">
                {role} at <span className="font-medium">{company}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-1 mb-4">
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 text-amber-400 fill-amber-400"
                />
              ))}
          </div>

          <p className="text-muted-foreground leading-relaxed italic">
            "{quote}"
          </p>
        </div>
      </div>
    </AnimatedElement>
  );
}

export function SocialProof() {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statsRef.current) return;

    // Mouse follow effect
    const handleMouseMove = (e: MouseEvent) => {
      const cards = statsRef.current?.querySelectorAll(".stat-card");
      cards?.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        animate(
          card.querySelector(".shine-effect")!,
          {
            background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(var(--primary-rgb), 0.07), transparent 70%)`,
          },
          { duration: 0 }
        );
      });
    };

    // Scroll animations
    inView(statsRef.current, () => {
      animate(
        ".stat-card",
        {
          opacity: [0, 1],
          y: [20, 0],
        },
        {
          delay: 0.2,
          duration: 0.5,
          easing: spring(),
        }
      );
    });

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative py-28 overflow-hidden">
      {/* Enhanced background with overlapping gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 dark:from-gray-900/30 to-background" />
      <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/30 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_80%)]" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-1/5 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/5 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Header Section */}
        <AnimatedElement animation="slideUp">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary gap-2">
              <Award className="h-4 w-4" /> SUCCESS STORIES FROM INDUSTRY
              LEADERS
            </span>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Don't Take Our Word For It:
              <br />
              See The Results For Yourself
            </h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              These property professionals were struggling with the same
              challenges you face today. Here's how our solution transformed
              their businesses:
            </p>
          </div>
        </AnimatedElement>

        {/* Stats Section with Enhanced Design */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 my-24"
        >
          {[
            {
              icon: Building,
              value: 50000,
              suffix: "+",
              label: "Properties Managed Successfully",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: ChartBar,
              value: 40,
              suffix: "%",
              label: "Average ROI Increase Year One",
              gradient: "from-violet-500 to-purple-500",
            },
            {
              icon: Star,
              value: 98,
              suffix: "%",
              label: "Client Retention Rate",
              gradient: "from-amber-500 to-orange-500",
            },
          ].map((stat, index) => (
            <AnimatedElement
              key={stat.label}
              animation="slideUp"
              delay={0.2 * (index + 1)}
            >
              <div className="stat-card group relative flex flex-col items-center p-8 bg-card dark:bg-card/80 rounded-2xl border border-muted/20 hover:border-primary/20 transition-colors">
                <div className="shine-effect pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100" />

                <div
                  className={cn(
                    "mb-5 rounded-xl p-3 shadow-lg ring-2 ring-white/10",
                    "bg-gradient-to-br",
                    stat.gradient
                  )}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </div>

                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  className="text-4xl font-bold text-foreground"
                />

                <p className="mt-2 text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            </AnimatedElement>
          ))}
        </div>

        {/* Enhanced Testimonials Section */}
        <div>
          <div className="text-center mb-14">
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
              Real Results from Real Clients
            </h3>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Join thousands of property professionals who've already
              transformed their operations and boosted their profits
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.name}
                {...testimonial}
                delay={0.2 * (index + 1)}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <AnimatedElement animation="fadeIn" delay={0.5}>
          <div className="mt-20 text-center bg-gradient-to-br from-primary/10 to-transparent p-10 rounded-2xl border border-primary/10">
            <div className="inline-block mb-6 px-4 py-1 bg-primary/20 rounded-full text-sm font-semibold text-primary">
              Limited Time: First 50 New Clients This Month
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Ready to join the property management revolution?
            </h3>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Start your risk-free 30-day trial today. No credit card required.
            </p>
            <Link
              className="mt-6 inline-block px-8 py-3 bg-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              to="/login"
            >
              Start Free Trial — Save 30% Today
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium">Hurry!</span> Special offer ends in
              48 hours
            </p>
          </div>
        </AnimatedElement>
      </div>
    </div>
  );
}
