import { Star, Award, ChartBar, Building } from "lucide-react";
import { AnimatedElement } from "../../components/AnimatedElement";
import { AnimatedNumber } from "../../components/AnimatedNumber";

export function SocialProof() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <AnimatedElement animation="slideUp" delay={0.2}>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl">
              <Building className="h-8 w-8 text-indigo-500 mb-4" />
              <AnimatedNumber
                value={50000}
                suffix="+"
                className="text-4xl font-bold text-gray-900"
              />
              <p className="text-gray-600 font-medium">Properties Managed</p>
            </div>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={0.3}>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl">
              <ChartBar className="h-8 w-8 text-indigo-500 mb-4" />
              <AnimatedNumber
                value={40}
                suffix="%"
                className="text-4xl font-bold text-gray-900"
              />
              <p className="text-gray-600 font-medium">Average ROI Increase</p>
            </div>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={0.4}>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl">
              <Star className="h-8 w-8 text-indigo-500 mb-4" />
              <AnimatedNumber
                value={98}
                suffix="%"
                className="text-4xl font-bold text-gray-900"
              />
              <p className="text-gray-600 font-medium">Client Satisfaction</p>
            </div>
          </AnimatedElement>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <AnimatedElement animation="slideUp" delay={0.2}>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <img
                    className="h-14 w-14 rounded-full ring-4 ring-indigo-50"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Sarah Wilson"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-gray-900">
                    Sarah Wilson
                  </h4>
                  <p className="text-indigo-600 font-medium">
                    Director of Operations at PropertyCo
                  </p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 text-lg">
                "Within 6 months, we reduced operational costs by 35% and
                increased tenant satisfaction scores by 28%. The AI-powered
                insights have been game-changing for our portfolio of 1,200+
                units."
              </p>
            </div>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={0.4}>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <img
                    className="h-14 w-14 rounded-full ring-4 ring-indigo-50"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Tom Anderson"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-gray-900">
                    Tom Anderson
                  </h4>
                  <p className="text-indigo-600 font-medium">
                    Real Estate Investor
                  </p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 text-lg">
                "The automated compliance checks have saved us countless hours
                and helped us avoid potential issues."
              </p>
            </div>
          </AnimatedElement>

          <AnimatedElement animation="slideUp" delay={0.6}>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <img
                    className="h-14 w-14 rounded-full ring-4 ring-indigo-50"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Emily Chen"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-gray-900">
                    Emily Chen
                  </h4>
                  <p className="text-indigo-600 font-medium">Property Owner</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 text-lg">
                "The tenant screening process is now seamless and much more
                reliable with AI-powered background checks."
              </p>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </div>
  );
}
