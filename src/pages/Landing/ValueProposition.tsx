import { ChartBar, Clock, Zap } from "lucide-react";
import { AnimatedElement } from "../../components/AnimatedElement";

export function ValueProposition() {
  return (
    <div
      className="py-24 bg-gradient-to-b from-white to-indigo-50"
      id="features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="slideUp">
          <div className="lg:text-center">
            <h2 className="text-base font-semibold tracking-wide text-indigo-600 uppercase">
              Powerful Features
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Transform Your Property Management
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Leverage cutting-edge AI technology to streamline operations,
              increase ROI, and deliver exceptional experiences.
            </p>
          </div>
        </AnimatedElement>

        <div className="mt-20">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            <AnimatedElement animation="slideLeft" delay={0.2}>
              <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <dt>
                  <div className="absolute flex items-center justify-center h-14 w-14 rounded-md bg-indigo-500 text-white -top-7">
                    <ChartBar className="h-7 w-7" />
                  </div>
                  <p className="ml-16 text-lg font-medium text-gray-900">
                    Predictive Analytics
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Forecast market trends with 94% accuracy. Make data-driven
                  decisions about pricing, maintenance, and investments.
                </dd>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideLeft" delay={0.4}>
              <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <dt>
                  <div className="absolute flex items-center justify-center h-14 w-14 rounded-md bg-indigo-500 text-white -top-7">
                    <Zap className="h-7 w-7" />
                  </div>
                  <p className="ml-16 text-lg font-medium text-gray-900">
                    Automated Operations
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Reduce manual tasks by 85%. Automate rent collection,
                  maintenance requests, and tenant communications.
                </dd>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideLeft" delay={0.6}>
              <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <dt>
                  <div className="absolute flex items-center justify-center h-14 w-14 rounded-md bg-indigo-500 text-white -top-7">
                    <Clock className="h-7 w-7" />
                  </div>
                  <p className="ml-16 text-lg font-medium text-gray-900">
                    Real-Time Monitoring
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Track property performance, occupancy rates, and maintenance
                  status in real-time through our intuitive dashboard.
                </dd>
              </div>
            </AnimatedElement>
          </dl>
        </div>
      </div>
    </div>
  );
}
