import {
  CheckCircle,
  Star,
  Zap,
  Building2,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedElement } from "../../components/animated/AnimatedElement";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PlanFeature = string;

interface Plan {
  name: string;
  price: string | "Custom";
  description: string;
  icon: typeof Building2 | typeof Zap;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  buttonLink: string;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for independent landlords",
    icon: Building2,
    features: [
      "Manage up to 10 properties",
      "Basic tenant screening",
      "Automated rent collection",
      "Maintenance ticketing",
      "Monthly analytics reports",
      "Email & chat support",
    ],
    buttonText: "Start Free Trial",
    buttonLink: "/signup",
  },
  {
    name: "Professional",
    price: "$99",
    description: "For growing property businesses",
    icon: Zap,
    features: [
      "Manage up to 50 properties",
      "Advanced tenant screening",
      "Automated rent collection",
      "Maintenance ticketing",
      "Weekly analytics reports",
      "Priority email & chat support",
    ],
    popular: true,
    buttonText: "Start Free Trial",
    buttonLink: "/signup",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    icon: Building2,
    features: [
      "Unlimited properties",
      "Custom tenant screening",
      "Automated rent collection",
      "Maintenance ticketing",
      "Daily analytics reports",
      "24/7 dedicated support",
    ],
    buttonText: "Contact Sales",
    buttonLink: "/contact",
  },
];

function PricingCard({ plan, delay }: { plan: Plan; delay: number }) {
  const Icon = plan.icon;
  return (
    <AnimatedElement animation="slideUp" delay={delay}>
      <div
        className={`group relative rounded-3xl overflow-hidden border transition-all duration-500
          ${
            plan.popular
              ? "border-primary bg-card/80 backdrop-blur-sm lg:scale-105 lg:-translate-y-2 shadow-xl shadow-primary/20"
              : "border-muted/40 bg-card/50 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
          }`}
      >
        {/* Highlight for popular plan */}
        {plan.popular && (
          <>
            <div className="absolute -top-px inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="absolute -top-px inset-x-0 h-24 bg-gradient-to-b from-primary/20 to-transparent" />
            <div className="absolute -bottom-px inset-x-0 h-24 bg-gradient-to-t from-primary/10 to-transparent" />
          </>
        )}

        {/* Popular badge */}
        {plan.popular && (
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-lg">
              Most Popular
            </span>
          </div>
        )}

        {/* Card content area */}
        <div className="p-8 pt-14">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`p-3 rounded-xl ${
                  plan.popular
                    ? "bg-primary text-white shadow-lg"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {plan.name}
              </h3>
            </div>
            <p className="text-muted-foreground mt-2">{plan.description}</p>
          </div>

          {/* Price display */}
          <div className="flex items-baseline mb-6">
            {typeof plan.price === "string" && (
              <>
                <span
                  className={`text-5xl font-extrabold tracking-tight ${
                    plan.popular ? "text-primary" : "text-foreground"
                  }`}
                >
                  {plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className="ml-2 text-muted-foreground text-lg">
                    /month
                  </span>
                )}
              </>
            )}
          </div>

          {/* Features list */}
          <ul className="space-y-4 mb-10">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 group/feature"
              >
                <CheckCircle
                  className={`h-5 w-5 mt-0.5 ${
                    plan.popular ? "text-primary" : "text-green-500"
                  } flex-shrink-0`}
                />
                <span className="text-muted-foreground group-hover/feature:text-foreground transition-colors">
                  {feature}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="inline-block ml-1.5 h-4 w-4 text-muted-foreground/70 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-64">
                        Learn more about {feature.toLowerCase()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to action */}
        <div className="p-8 pt-0">
          <Link
            to={plan.buttonLink}
            className={`flex items-center justify-center w-full py-4 px-6 rounded-xl text-base font-medium transition-all duration-300 shadow-sm
              ${
                plan.popular
                  ? "bg-primary text-white hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
                  : "bg-card text-foreground border border-muted hover:border-primary/30 hover:bg-primary/5"
              }`}
          >
            {plan.buttonText}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </AnimatedElement>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-28 overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 dark:from-gray-900/30 to-background" />
      <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/30 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_80%)]" />

      {/* Decorative elements */}
      <div className="absolute top-40 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="slideUp">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
              <Star className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-semibold text-primary">
                FLEXIBLE PRICING
              </span>
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Scale Your Property{" "}
              <span className="text-primary">Management</span>
            </h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade as you grow. No hidden fees or long-term
              contracts.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              delay={0.2 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
