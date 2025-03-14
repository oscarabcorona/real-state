import { CheckCircle, Star, Zap, BuildingIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedElement } from "../../components/AnimatedElement";

export function PricingSection() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="slideUp">
          <div className="lg:text-center mb-16">
            <span className="inline-flex items-center text-sm font-semibold text-indigo-600 gap-2">
              <Star className="h-4 w-4" /> FLEXIBLE PRICING
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Scale Your Property Management
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Start free, upgrade as you grow. No hidden fees or long-term
              contracts.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:-mx-8">
          {/* Starter Plan */}
          <AnimatedElement animation="slideUp" delay={0.2}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300">
              <div className="p-8">
                <h3 className="inline-flex items-center text-2xl font-bold text-gray-900">
                  <BuildingIcon className="h-6 w-6 mr-2 text-indigo-500" />
                  Starter
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    $29
                  </span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">
                    /mo
                  </span>
                </div>
                <p className="mt-5 text-gray-500">
                  Perfect for independent landlords
                </p>

                <ul className="mt-8 space-y-4 text-gray-600">
                  {[
                    "Manage up to 10 properties",
                    "Basic tenant screening",
                    "Automated rent collection",
                    "Maintenance ticketing",
                    "Monthly analytics reports",
                    "Email & chat support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 bg-gray-50">
                <Link
                  to="/signup"
                  className="block w-full text-center px-6 py-3 text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </AnimatedElement>

          {/* Professional Plan - Most Popular */}
          <AnimatedElement animation="slideUp" delay={0.3}>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden lg:scale-110">
              <div className="absolute top-0 inset-x-0">
                <div className="w-full text-center transform translate-y-px">
                  <span className="inline-flex rounded-full bg-indigo-500 px-4 py-1 text-sm font-semibold tracking-wider uppercase text-white">
                    Most Popular
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="inline-flex items-center text-2xl font-bold text-gray-900">
                  <Zap className="h-6 w-6 mr-2 text-indigo-500" />
                  Professional
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    $99
                  </span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">
                    /mo
                  </span>
                </div>
                <p className="mt-5 text-gray-500">
                  For growing property businesses
                </p>

                <ul className="mt-8 space-y-4 text-gray-600">
                  {[
                    "Manage up to 50 properties",
                    "Advanced tenant screening",
                    "Automated rent collection",
                    "Maintenance ticketing",
                    "Weekly analytics reports",
                    "Priority email & chat support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 bg-gray-50">
                <Link
                  to="/signup"
                  className="block w-full text-center px-6 py-3 text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </AnimatedElement>

          {/* Enterprise Plan */}
          <AnimatedElement animation="slideUp" delay={0.4}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300">
              <div className="p-8">
                <h3 className="inline-flex items-center text-2xl font-bold text-gray-900">
                  <BuildingIcon className="h-6 w-6 mr-2 text-indigo-500" />
                  Enterprise
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    Custom
                  </span>
                </div>
                <p className="mt-5 text-gray-500">For large organizations</p>

                <ul className="mt-8 space-y-4 text-gray-600">
                  {[
                    "Unlimited properties",
                    "Custom tenant screening",
                    "Automated rent collection",
                    "Maintenance ticketing",
                    "Daily analytics reports",
                    "24/7 dedicated support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 bg-gray-50">
                <Link
                  to="/contact"
                  className="block w-full text-center px-6 py-3 text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </div>
  );
}
