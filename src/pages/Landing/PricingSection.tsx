import { CheckCircle, Star, Zap, Building2, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedElement } from "../../components/AnimatedElement";
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
        className={`group relative bg-gradient-to-b from-white to-gray-50/50 rounded-2xl overflow-hidden
          ${
            plan.popular
              ? "lg:scale-105 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500"
              : "shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
          } transition-all duration-300`}
      >
        {plan.popular && (
          <div className="absolute -top-px inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        )}
        {plan.popular && (
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform -translate-y-px">
              Most Popular
            </span>
          </div>
        )}

        <div className="p-8 pt-16">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-lg ${
                plan.popular
                  ? "bg-indigo-500 text-white"
                  : "bg-indigo-50 text-indigo-500"
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold">{plan.name}</h3>
          </div>

          <div className="flex items-baseline mb-6">
            {typeof plan.price === "string" && (
              <>
                <span className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                  {plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className="ml-2 text-gray-500 text-lg">/month</span>
                )}
              </>
            )}
          </div>

          <p className="text-gray-600 mb-8">{plan.description}</p>

          <ul className="space-y-4 mb-8">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 group/feature"
              >
                <CheckCircle
                  className={`h-5 w-5 mt-0.5 ${
                    plan.popular ? "text-indigo-500" : "text-green-500"
                  } flex-shrink-0`}
                />
                <span className="text-gray-600 group-hover/feature:text-gray-900 transition-colors">
                  {feature}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="inline-block ml-1.5 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
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

        <div className="p-8 bg-gradient-to-b from-transparent to-gray-50">
          <Link
            to={plan.buttonLink}
            className={`block w-full text-center px-6 py-3.5 text-sm font-semibold rounded-lg
              ${
                plan.popular
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                  : "bg-white text-gray-900 ring-1 ring-gray-200 hover:ring-gray-300 hover:bg-gray-50"
              } transition-all duration-200 shadow-sm`}
          >
            {plan.buttonText}
          </Link>
        </div>
      </div>
    </AnimatedElement>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-transparent to-indigo-50/30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="slideUp">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 mb-4">
              <Star className="h-4 w-4 text-indigo-500 mr-2" />
              <span className="text-sm font-semibold text-indigo-700">
                FLEXIBLE PRICING
              </span>
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Scale Your Property{" "}
              <span className="text-indigo-500">Management</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade as you grow. No hidden fees or long-term
              contracts.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 gap-y-8 gap-x-6 lg:grid-cols-3 lg:gap-x-8">
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
