import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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

  const updateQuestionCount = (category: FAQItem["category"]) => {
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

    return () => clearInterval(timer);
  };

  useEffect(() => {
    updateQuestionCount("general");
  }, []);

  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 dark:from-primary/10 via-background to-background" />
      <div className="relative py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <AnimatedElement animation="slideUp">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-1.5">
                <HelpCircle className="mr-2 h-4 w-4 text-primary" />
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
                  className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                >
                  Contact us
                </a>
              </p>
            </div>
          </AnimatedElement>

          <div className="mt-16">
            <Tabs
              defaultValue="general"
              className="w-full"
              onValueChange={(value) =>
                updateQuestionCount(value as FAQItem["category"])
              }
            >
              <div className="flex justify-center mb-12">
                <TabsList className="bg-muted p-1 rounded-full">
                  {categories.map(({ id, label }) => (
                    <TabsTrigger
                      key={id}
                      value={id}
                      className="px-6 py-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {categories.map(({ id }) => (
                <TabsContent key={id} value={id}>
                  <AnimatedElement animation="slideUp" delay={0.1}>
                    <Accordion type="single" collapsible className="grid gap-4">
                      {faqs
                        .filter((faq) => faq.category === id)
                        .map((faq, index) => (
                          <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className={cn(
                              "bg-card dark:bg-card/80 hover:bg-accent/5 dark:hover:bg-accent/10",
                              "data-[state=open]:bg-accent/10 dark:data-[state=open]:bg-accent/20",
                              "rounded-xl border shadow-sm dark:border-gray-800",
                              "transition-all duration-200"
                            )}
                          >
                            <AccordionTrigger className="px-6 py-4 text-base font-medium text-foreground hover:no-underline group">
                              <span className="group-hover:text-primary transition-colors">
                                {faq.question}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                              <div className="text-muted-foreground prose prose-sm max-w-none">
                                {faq.answer}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  </AnimatedElement>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
