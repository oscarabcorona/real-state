import { animate, inView, spring } from "motion";
import { Star, Award, ChartBar, Building } from "lucide-react";
import { useEffect, useRef } from "react";
import { AnimatedElement } from "../../components/AnimatedElement";
import { AnimatedNumber } from "../../components/AnimatedNumber";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah Wilson",
    role: "Director of Operations",
    company: "PropertyCo",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote:
      "Within 6 months, we reduced operational costs by 35% and increased tenant satisfaction scores by 28%. The AI-powered insights have been game-changing for our portfolio of 1,200+ units.",
  },
  {
    name: "Tom Anderson",
    role: "Real Estate Investor",
    company: "Anderson Properties",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote:
      "The automated compliance checks have saved us countless hours and helped us avoid potential issues.",
  },
  {
    name: "Emily Chen",
    role: "Property Manager",
    company: "Urban Living",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    quote:
      "The tenant screening process is now seamless and much more reliable with AI-powered background checks.",
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
      animate(element, { y: -5 }, { duration: 0.2, easing: spring() });
    });

    element.addEventListener("mouseleave", () => {
      animate(element, { y: 0 }, { duration: 0.2, easing: spring() });
    });
  }, []);

  return (
    <AnimatedElement animation="slideUp" delay={delay}>
      <div
        ref={cardRef}
        className="relative h-full bg-white p-8 rounded-2xl shadow-lg transition-shadow hover:shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 rounded-2xl" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <img
              className="h-14 w-14 rounded-full object-cover ring-4 ring-primary/10"
              src={image}
              alt={name}
            />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{name}</h4>
              <p className="text-sm text-primary">
                {role} at <span className="font-medium">{company}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-1 mb-4">
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
              ))}
          </div>
          <p className="text-gray-700 leading-relaxed">{quote}</p>
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
            background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(var(--primary-rgb), 0.05), transparent 70%)`,
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
    <div className="relative bg-gradient-to-b from-gray-50 to-white py-24 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-gray-100/50 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_70%)]" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="slideUp">
          <div className="lg:text-center mb-16">
            <span className="inline-flex items-center text-sm font-semibold text-indigo-600 gap-2">
              <Award className="h-4 w-4" /> TRUSTED BY INDUSTRY LEADERS
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Join 2,000+ Property Managers Who Trust Our Solution
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              Empowering property management across 50+ countries with
              innovative AI solutions
            </p>
          </div>
        </AnimatedElement>

        {/* Stats Section with Improved Design */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {[
            {
              icon: Building,
              value: 50000,
              suffix: "+",
              label: "Properties Managed",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: ChartBar,
              value: 40,
              suffix: "%",
              label: "Average ROI Increase",
              gradient: "from-violet-500 to-purple-500",
            },
            {
              icon: Star,
              value: 98,
              suffix: "%",
              label: "Client Satisfaction",
              gradient: "from-amber-500 to-orange-500",
            },
          ].map((stat, index) => (
            <AnimatedElement
              key={stat.label}
              animation="slideUp"
              delay={0.2 * (index + 1)}
            >
              <div className="stat-card group relative flex flex-col items-center p-6 bg-white rounded-2xl">
                <div className="shine-effect pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100" />
                <div
                  className={cn(
                    "mb-4 rounded-xl p-2.5 ring-2 ring-inset ring-gray-100",
                    "bg-gradient-to-br",
                    stat.gradient
                  )}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
                />
                <p className="mt-2 text-gray-600 font-medium">{stat.label}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>

        {/* Testimonials Section - Updated to use TestimonialCard */}
        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              {...testimonial}
              delay={0.2 * (index + 1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
