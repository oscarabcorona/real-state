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
  TrendingUp,
} from "lucide-react";
import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const features = [
  {
    icon: ChartBar,
    key: "analytics",
    color: "from-blue-600 to-cyan-500",
    preview: "/previews/analytics.mp4",
  },
  {
    icon: Zap,
    key: "automation",
    color: "from-violet-600 to-indigo-500",
    preview: "/previews/automation.mp4",
  },
  {
    icon: Clock,
    key: "monitoring",
    color: "from-rose-500 to-pink-500",
    preview: "/previews/monitoring.mp4",
  },
];

const allFeatures = {
  analytics: [
    {
      icon: ChartBar,
      key: "predictive",
    },
    {
      icon: BarChart2,
      key: "financial",
    },
    {
      icon: TrendingUp,
      key: "market",
    },
  ],
  automation: [
    {
      icon: Zap,
      key: "operations",
    },
    {
      icon: Settings,
      key: "workflows",
    },
  ],
  management: [
    {
      icon: Building2,
      key: "property",
    },
    {
      icon: Users,
      key: "portal",
    },
  ],
  security: [
    {
      icon: Shield,
      key: "advanced",
    },
    {
      icon: MessageSquare,
      key: "support",
    },
  ],
};

export function ValueProposition() {
  const { t } = useTranslation();

  return (
    <div className="py-24 relative overflow-hidden" id="features">
      {/* Background with improved visual effect */}
      <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/50 bg-[size:30px_30px] [mask-image:radial-gradient(white,transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white to-white/50 dark:from-background/50 dark:via-background dark:to-background/50" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="slideUp">
          <div className="text-center">
            <h2 className="inline-flex items-center rounded-full bg-gradient-to-r from-primary/80 to-primary px-4 py-1.5 text-sm font-medium text-primary-foreground ring-1 ring-inset ring-primary/20">
              {t("valueProposition.badge")}
            </h2>
            <p className="mt-8 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {t("valueProposition.title")}
            </p>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
              {t("valueProposition.subtitle")}
            </p>
          </div>
        </AnimatedElement>

        <div className="mt-24">
          <dl className="grid gap-10 md:grid-cols-3">
            {features.map((feature, index) => (
              <AnimatedElement
                key={feature.key}
                animation="slideLeft"
                delay={0.2 * (index + 1)}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="group relative bg-card/50 backdrop-blur-sm dark:bg-card/30 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-muted/40 hover:border-primary/30">
                      {/* Hover effect glow */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur"></div>

                      <div className="relative">
                        <div
                          className={`flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}
                        >
                          <feature.icon className="h-8 w-8" />
                        </div>

                        <p className="text-xl font-bold mb-3 text-foreground">
                          {t(`valueProposition.features.${feature.key}.title`)}
                        </p>

                        <dd className="text-muted-foreground leading-relaxed">
                          {t(
                            `valueProposition.features.${feature.key}.description`
                          )}
                        </dd>

                        <div className="mt-6 flex items-center text-primary">
                          <span className="font-medium">
                            {t("valueProposition.cta.learnMore")}
                          </span>
                          <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-background/95 backdrop-blur-md border-muted">
                    <div className="aspect-video rounded-t-lg overflow-hidden">
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
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-foreground">
                        {t(`valueProposition.features.${feature.key}.title`)}
                      </h3>
                      <p className="mt-3 text-muted-foreground text-lg">
                        {t(
                          `valueProposition.features.${feature.key}.description`
                        )}
                      </p>
                      <Button className="mt-6" size="lg">
                        {t("valueProposition.cta.getStarted")}
                        <ChevronRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </AnimatedElement>
            ))}
          </dl>
        </div>

        <AnimatedElement animation="slideUp" delay={0.8}>
          <div className="mt-24 text-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/30 bg-transparent hover:bg-primary/5 px-8 py-6 h-auto text-base rounded-full"
                >
                  {t("valueProposition.allFeatures.cta")}
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto bg-background/98 dark:bg-background/95 backdrop-blur-md border-muted/50">
                <div className="p-8">
                  <h2 className="text-3xl font-bold mb-10 text-foreground">
                    {t("valueProposition.allFeatures.title")}
                  </h2>
                  <div className="grid gap-10 md:grid-cols-2">
                    {Object.entries(allFeatures).map(([category, items]) => (
                      <div key={category} className="space-y-6">
                        <h3 className="text-xl font-semibold capitalize text-foreground flex items-center">
                          <div className="h-1.5 w-6 rounded-full bg-primary mr-3"></div>
                          {t(
                            `valueProposition.allFeatures.categories.${category}.title`
                          )}
                        </h3>
                        <div className="space-y-5">
                          {items.map((item) => (
                            <div
                              key={item.key}
                              className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/70 dark:hover:bg-muted/20 transition-colors border border-transparent hover:border-muted"
                            >
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
                                <item.icon className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="text-base font-semibold text-foreground">
                                  {t(
                                    `valueProposition.allFeatures.categories.${category}.items.${item.key}.title`
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {t(
                                    `valueProposition.allFeatures.categories.${category}.items.${item.key}.description`
                                  )}
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

        {/* Limited Time Offer */}
        <AnimatedElement animation="fadeIn" delay={1.0}>
          <div className="mt-12 mx-auto max-w-2xl border border-primary/30 bg-primary/5 rounded-xl p-6 text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              {t("valueProposition.limitedOffer.badge")}
            </p>
            <h3 className="text-xl font-bold mb-3">
              {t("valueProposition.limitedOffer.title")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("valueProposition.limitedOffer.subtitle")}
            </p>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              {t("valueProposition.limitedOffer.button")}
            </Button>
          </div>
        </AnimatedElement>
      </div>
    </div>
  );
}
