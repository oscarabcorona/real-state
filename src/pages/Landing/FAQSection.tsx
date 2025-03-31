import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { HelpCircle, Search, ArrowRight, CheckCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "pricing" | "security";
}

interface FAQQuestions {
  general: FAQItem[];
  pricing: FAQItem[];
  security: FAQItem[];
}

export function FAQSection() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<FAQItem["category"]>("general");

  const rawQuestions = t("faq.questions", { returnObjects: true });
  const questions = rawQuestions as FAQQuestions;

  const faqs = questions
    ? [
        ...(Array.isArray(questions.general)
          ? questions.general.map((q: FAQItem) => ({
              ...q,
              category: "general" as const,
            }))
          : []),
        ...(Array.isArray(questions.pricing)
          ? questions.pricing.map((q: FAQItem) => ({
              ...q,
              category: "pricing" as const,
            }))
          : []),
        ...(Array.isArray(questions.security)
          ? questions.security.map((q: FAQItem) => ({
              ...q,
              category: "security" as const,
            }))
          : []),
      ]
    : [];

  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>(
    faqs.filter((faq) => faq.category === "general")
  );

  const categories = [
    { id: "general", label: t("faq.categories.general") },
    { id: "pricing", label: t("faq.categories.pricing") },
    { id: "security", label: t("faq.categories.security") },
  ] as const;

  const benefits = t("faq.whyChooseUs.benefits", {
    returnObjects: true,
  }) as string[];

  const updateQuestionCount = (category: FAQItem["category"]) => {
    setSelectedCategory(category);
    handleSearch(searchQuery, category);
  };

  const handleSearch = (query: string, category = selectedCategory) => {
    setSearchQuery(query);
    const filtered = faqs
      .filter((faq) => faq.category === category)
      .filter(
        (faq) =>
          faq.question.toLowerCase().includes(query.toLowerCase()) ||
          faq.answer.toLowerCase().includes(query.toLowerCase())
      );
    setFilteredFaqs(filtered);
  };

  useEffect(() => {
    updateQuestionCount("general");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative py-28 overflow-hidden" id="faq">
      {/* Enhanced background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/10 to-background" />
      <div className="absolute inset-0 bg-grid-gray-100/30 dark:bg-grid-gray-800/20 bg-[size:24px_24px] [mask-image:radial-gradient(white,transparent_90%)]" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container relative max-w-5xl mx-auto px-4">
        <AnimatedElement animation="slideUp">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 dark:bg-primary/15 px-4 py-1.5">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("faq.badge")}
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("faq.title")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("faq.subtitle")}{" "}
              <a
                href="#contact"
                className="text-primary hover:text-primary/80 underline-offset-4 hover:underline font-medium"
              >
                {t("faq.stillHaveQuestions")}
              </a>
            </p>
          </div>
        </AnimatedElement>

        {/* Search bar */}
        <AnimatedElement animation="fadeIn" delay={0.2}>
          <div className="relative max-w-2xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t("faq.search.placeholder")}
                className="pl-10 py-6 bg-card/50 border-muted shadow-sm focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="slideUp" delay={0.3}>
          <div className="rounded-2xl border border-muted/60 bg-card/60 backdrop-blur-sm shadow-lg p-6 md:p-8">
            <Tabs
              defaultValue="general"
              className="w-full"
              onValueChange={(value) =>
                updateQuestionCount(value as FAQItem["category"])
              }
            >
              <div className="flex justify-center mb-8">
                <TabsList className="bg-muted/70 p-1 rounded-full">
                  {categories.map(({ id, label }) => (
                    <TabsTrigger
                      key={id}
                      value={id}
                      className="px-6 py-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {categories.map(({ id }) => (
                <TabsContent key={id} value={id} className="space-y-6">
                  <AnimatedElement animation="fadeIn" delay={0.1}>
                    <Accordion type="single" collapsible className="space-y-4">
                      {filteredFaqs.length > 0 ? (
                        filteredFaqs
                          .filter((faq) => faq.category === id)
                          .map((faq, index) => (
                            <AccordionItem
                              key={index}
                              value={`item-${index}`}
                              className={cn(
                                "bg-card dark:bg-card/80 border border-muted/50 hover:border-primary/30",
                                "data-[state=open]:bg-muted/30 dark:data-[state=open]:bg-muted/10",
                                "rounded-xl shadow-sm",
                                "transition-all duration-200"
                              )}
                            >
                              <AccordionTrigger className="px-6 py-4 text-base font-medium text-foreground hover:no-underline group">
                                <span className="group-hover:text-primary transition-colors">
                                  {faq.question}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-6 pt-2">
                                <div className="text-muted-foreground prose prose-sm max-w-none">
                                  {faq.answer}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted/50 mb-4">
                            <HelpCircle className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            {t("faq.noResults.title")}
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            {t("faq.noResults.description", {
                              query: searchQuery,
                            })}
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => handleSearch("")}
                          >
                            {t("faq.noResults.action")}
                          </Button>
                        </div>
                      )}
                    </Accordion>
                  </AnimatedElement>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </AnimatedElement>

        {/* Why Choose Us Section */}
        <AnimatedElement animation="slideUp" delay={0.4}>
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold mb-8">
              {t("faq.whyChooseUs.title")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-muted/50"
                >
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-left">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedElement>

        {/* CTA Section */}
        <AnimatedElement animation="slideUp" delay={0.5}>
          <div className="mt-20 text-center bg-gradient-to-b from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {t("faq.cta.title")}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("faq.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                {t("faq.cta.trial")}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                {t("faq.cta.demo")}
              </Button>
            </div>
            <p className="text-sm text-primary mt-6">{t("faq.cta.offer")}</p>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}
