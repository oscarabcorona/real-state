import { Link } from "react-router-dom";
import { AnimatedElement } from "../../components/AnimatedElement";
import { AnimatedNumber } from "../../components/AnimatedNumber";
import { AnimatedText } from "../../components/AnimatedText";

export function HeroSection() {
  return (
    <div className="relative min-h-[90vh] flex items-center">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1973&q=80"
          alt="Modern building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 mix-blend-multiply" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
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

            <AnimatedElement animation="slideUp" delay={1.2}>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  to="/login"
                  className="rounded-md bg-indigo-500 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  Start Free Trial
                </Link>
                <a
                  href="#features"
                  className="text-lg font-semibold leading-6 text-white"
                >
                  See How It Works <span aria-hidden="true">→</span>
                </a>
              </div>
            </AnimatedElement>

            <div className="mt-8 grid grid-cols-3 gap-4 items-center">
              <AnimatedElement animation="scale" delay={1.4}>
                <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <AnimatedNumber
                    value={98}
                    suffix="%"
                    className="text-3xl font-bold text-white"
                  />
                  <span className="text-sm text-indigo-200">
                    Client Satisfaction
                  </span>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="scale" delay={1.6}>
                <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <AnimatedNumber
                    value={75000}
                    suffix="+"
                    className="text-3xl font-bold text-white"
                  />
                  <span className="text-sm text-indigo-200">Units Managed</span>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="scale" delay={1.8}>
                <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <AnimatedNumber
                    value={40}
                    suffix="%"
                    className="text-3xl font-bold text-white"
                  />
                  <span className="text-sm text-indigo-200">
                    Cost Reduction
                  </span>
                </div>
              </AnimatedElement>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
