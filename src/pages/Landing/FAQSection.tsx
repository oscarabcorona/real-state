import { AnimatedElement } from "../../components/animated/AnimatedElement";
import {
  HelpCircle,
  Search,
  ArrowRight,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
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
    question: "How quickly will I see ROI after implementing your platform?",
    answer:
      "Most clients see measurable ROI within the first 30 days. On average, property managers report a 40% reduction in administrative tasks and a 32% increase in rental income within 90 days. Our onboarding team will work with you to identify your biggest opportunities for immediate financial gains.",
    category: "general",
  },
  {
    question:
      "What makes your AI property management different from competitors?",
    answer:
      "Unlike traditional property management software that simply digitizes paperwork, our AI analyzes real-time market data, tenant behavior, and maintenance patterns to provide predictive insights. It's like having a team of data scientists and property experts working for you 24/7. This intelligent approach helps reduce costs by 40% and increase property ROI by up to 25% - results our competitors simply can't match.",
    category: "general",
  },
  {
    question: "Is my data secure with your platform?",
    answer:
      "Absolutely. We use bank-level 256-bit encryption, comply with PCI DSS standards, and have regular third-party security audits. Your data is stored in redundant, geo-distributed data centers with 99.99% uptime. We're also SOC 2 Type II certified, which means our security practices have been rigorously verified by independent auditors.",
    category: "security",
  },
  {
    question: "How easy is it to switch from my current system?",
    answer:
      "Remarkably easy. Our data migration team handles everything - typically completing full transitions in under 5 days with zero downtime. We've built automated import tools for all major property management platforms, and offer a white-glove service where we manually transfer any custom data. 97% of clients rate our onboarding process as 'exceptionally smooth'.",
    category: "general",
  },
  {
    question: "What happens after my free trial ends?",
    answer:
      "You'll receive a notification 7 days before your trial ends with a summary of your achieved results. You can then choose a plan that fits your needs or schedule a call with our team to discuss custom options. There are no automatic charges, and you can export your data anytime. If you decide to subscribe, we'll apply any special promotional discounts you qualified for during signup.",
    category: "pricing",
  },
  {
    question: "Do you guarantee results?",
    answer:
      "Yes. We offer a 90-day money-back guarantee. If you don't see measurable improvements in your property management efficiency and profitability within 90 days of proper platform usage, we'll refund your subscription. We can make this guarantee because 98.7% of our clients achieve or exceed their ROI targets.",
    category: "pricing",
  },
  {
    question:
      "Is your platform suitable for small landlords with just a few properties?",
    answer:
      "Absolutely! Our Starter plan is specifically designed for independent landlords with up to 10 properties. Many of our most enthusiastic clients started with just 2-3 properties and saw significant time savings and income improvement. The platform scales with your growth, so you only pay for what you need.",
    category: "pricing",
  },
  {
    question: "How long does implementation and training take?",
    answer:
      "Most users are up and running in less than a day. Our intuitive interface requires minimal training, and we provide comprehensive video tutorials and documentation. For our Professional and Enterprise plans, we include personalized onboarding sessions to ensure you're maximizing value from day one.",
    category: "general",
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
                Answering Your Questions
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Common Questions About Transforming Your Property Business
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get answers to the questions property professionals ask before
              achieving average ROI increases of 40%.{" "}
              <a
                href="#contact"
                className="text-primary hover:text-primary/80 underline-offset-4 hover:underline font-medium"
              >
                Still have questions? Talk to an expert
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

        {/* Why Choose Us Section */}
        <AnimatedElement animation="fadeIn" delay={0.4}>
          <div className="mt-16 px-6 py-8 rounded-2xl border border-primary/20 bg-primary/5">
            <h3 className="text-xl font-bold mb-6 text-center">
              Why Property Managers Choose Our Platform
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "90-day money-back guarantee",
                "No credit card required for trial",
                "Free data migration & setup",
                "Dedicated implementation manager",
                "24/7 customer support",
                "Regular platform updates",
                "Proven ROI with case studies",
                "Industry-leading security",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedElement>

        {/* Additional help section */}
        <AnimatedElement animation="fadeIn" delay={0.5}>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              Ready to transform your property management?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of property professionals who are already saving
              time, reducing costs, and maximizing returns with our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="gap-2">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                Schedule a Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="text-primary font-medium">Limited offer:</span>{" "}
              Get 30% off your first 3 months when you sign up today
            </p>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}
