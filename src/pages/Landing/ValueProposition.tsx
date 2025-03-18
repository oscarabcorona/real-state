import {
  ChartBar,
  ChevronRightIcon,
  Clock,
  Zap,
  Building2,
  Shield,
  Users,
  BarChart2,
  MessageSquare,
  Settings,
} from "lucide-react";
import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ChartBar,
    title: "Predictive Analytics",
    description:
      "Forecast market trends with 94% accuracy. Make data-driven decisions about pricing, maintenance, and investments.",
    color: "from-blue-600 to-cyan-500",
    preview: "/previews/analytics.mp4",
  },
  {
    icon: Zap,
    title: "Automated Operations",
    description:
      "Reduce manual tasks by 85%. Automate rent collection, maintenance requests, and tenant communications.",
    color: "from-violet-600 to-indigo-500",
    preview: "/previews/automation.mp4",
  },
  {
    icon: Clock,
    title: "Real-Time Monitoring",
    description:
      "Track property performance, occupancy rates, and maintenance status in real-time through our intuitive dashboard.",
    color: "from-rose-500 to-pink-500",
    preview: "/previews/monitoring.mp4",
  },
];

const allFeatures = {
  analytics: [
    {
      icon: ChartBar,
      title: "Predictive Analytics",
      description: "Forecast market trends with 94% accuracy.",
    },
    {
      icon: BarChart2,
      title: "Financial Reporting",
      description: "Comprehensive financial analytics and reporting tools.",
    },
  ],
  automation: [
    {
      icon: Zap,
      title: "Automated Operations",
      description: "Reduce manual tasks by 85%.",
    },
    {
      icon: Settings,
      title: "Smart Workflows",
      description: "Customizable automation workflows for any process.",
    },
  ],
  management: [
    {
      icon: Building2,
      title: "Property Management",
      description: "Centralized property and tenant management.",
    },
    {
      icon: Users,
      title: "Tenant Portal",
      description: "Self-service portal for tenant requests.",
    },
  ],
  security: [
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Enterprise-grade security and compliance.",
    },
    {
      icon: MessageSquare,
      title: "24/7 Support",
      description: "Round-the-clock customer support.",
    },
  ],
};

export function ValueProposition() {
  return (
    <div className="py-24 relative overflow-hidden" id="features">
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/50 bg-[size:30px_30px] [mask-image:radial-gradient(white,transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white to-white/50 dark:from-background/50 dark:via-background dark:to-background/50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="slideUp">
          <div className="text-center">
            <h2 className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary/80 to-primary px-3 py-1 text-sm font-medium text-primary-foreground ring-1 ring-inset ring-primary/20">
              Powerful Features
            </h2>
            <p className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Transform Your Property Management
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
              Leverage cutting-edge AI technology to streamline operations,
              increase ROI, and deliver exceptional experiences.
            </p>
          </div>
        </AnimatedElement>

        <div className="mt-20">
          <dl className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <AnimatedElement
                key={feature.title}
                animation="slideLeft"
                delay={0.2 * (index + 1)}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="group relative bg-card dark:bg-card/80 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <dt>
                        <div
                          className={`absolute flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-r ${feature.color} text-white -top-7 group-hover:scale-110 transition-transform`}
                        >
                          <feature.icon className="h-7 w-7" />
                        </div>
                        <p className="ml-16 text-lg font-semibold">
                          {feature.title}
                        </p>
                      </dt>
                      <dd className="mt-2 ml-16 text-muted-foreground">
                        {feature.description}
                      </dd>
                      <div className="mt-4 ml-16 flex items-center text-primary">
                        <span className="text-sm font-medium">Learn more</span>
                        <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      >
                        <source src={feature.preview} type="video/mp4" />
                      </video>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </AnimatedElement>
            ))}
          </dl>
        </div>

        <AnimatedElement animation="slideUp" delay={0.8}>
          <div className="mt-20 text-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline">
                  Explore All Features
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto bg-background dark:bg-background/95 backdrop-blur-sm">
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-8 text-foreground">
                    All Features
                  </h2>
                  <div className="grid gap-8 md:grid-cols-2">
                    {Object.entries(allFeatures).map(([category, items]) => (
                      <div key={category} className="space-y-6">
                        <h3 className="text-lg font-medium capitalize text-foreground">
                          {category}
                        </h3>
                        <div className="space-y-4">
                          {items.map((item) => (
                            <div
                              key={item.title}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
                                <item.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-foreground">
                                  {item.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </AnimatedElement>
      </div>
    </div>
  );
}
