import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { HelpCircle, Search, ArrowRight, MessageSquare } from "lucide-react";
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

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "pricing" | "security";
}

const faqs: FAQItem[] = [
  {
    question: "How quickly can I get started with the platform?",
    answer:
      "Get started in less than 5 minutes. Our onboarding wizard will guide you through importing your properties, setting up payment methods, and customizing your dashboard.",
    category: "general",
  },
  {
    question: "What makes your AI property management different?",
    answer:
      "Our AI analyzes real-time market data, tenant behavior, and maintenance patterns to provide predictive insights. This helps reduce costs by 40% and increase property ROI by up to 25%.",
    category: "general",
  },
  {
    question: "How secure is the payment processing?",
    answer:
      "We use bank-level 256-bit encryption and comply with PCI DSS standards. All transactions are monitored in real-time for fraud detection.",
    category: "security",
  },
  {
    question: "Can I integrate with my existing accounting software?",
    answer:
      "Yes, we offer seamless integration with QuickBooks, Xero, and other major accounting platforms. Our API also allows custom integrations.",
    category: "general",
  },
  {
    question: "What happens after the free trial ends?",
    answer:
      "You'll be notified before the trial ends and can choose a plan that fits your needs. No automatic charges, and you can export your data anytime.",
    category: "pricing",
  },
];

const categories = [
  { id: "general", label: "General" },
  { id: "pricing", label: "Pricing" },
  { id: "security", label: "Security" },
] as const;

export function FAQSection() {
  const [questionCount, setQuestionCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>(
    faqs.filter((faq) => faq.category === "general")
  );
  const [selectedCategory, setSelectedCategory] =
    useState<FAQItem["category"]>("general");

  const updateQuestionCount = (category: FAQItem["category"]) => {
    setSelectedCategory(category);
    const count = faqs.filter((faq) => faq.category === category).length;
    let start = 0;
    const duration = 1000;
    const steps = Math.ceil(duration / (1000 / 60));
    const stepValue = count / steps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start > count) {
        setQuestionCount(count);
        clearInterval(timer);
      } else {
        setQuestionCount(Math.floor(start));
      }
    }, 1000 / 60);

    // Filter FAQs based on category and search query
    handleSearch(searchQuery, category);

    return () => clearInterval(timer);
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
                {questionCount} Questions Answered
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about our property management
              platform. Can't find what you're looking for?{" "}
              <a
                href="#contact"
                className="text-primary hover:text-primary/80 underline-offset-4 hover:underline font-medium"
              >
                Contact our support team
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
                placeholder="Search for questions..."
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
                            No questions found
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            We couldn't find any questions matching "
                            {searchQuery}" in this category
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => handleSearch("")}
                          >
                            Clear search
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

        {/* Additional help section */}
        <AnimatedElement animation="fadeIn" delay={0.5}>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              If you can't find the answer you're looking for, please reach out
              to our customer support team. We're here to help 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="gap-2">
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                View Documentation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}
