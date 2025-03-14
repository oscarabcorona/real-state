import { AnimatedElement } from "../../components/AnimatedElement";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

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

export function FAQSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<FAQItem["category"]>("general");

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="slideUp">
          <div className="lg:text-center mb-16">
            <span className="inline-flex items-center text-sm font-semibold text-indigo-600 gap-2">
              <HelpCircle className="h-4 w-4" /> SUPPORT
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl lg:mx-auto">
              Everything you need to know about our property management platform
            </p>
          </div>
        </AnimatedElement>

        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center gap-4 mb-8">
            {["general", "pricing", "security"].map((category) => (
              <button
                key={category}
                onClick={() =>
                  setActiveCategory(category as FAQItem["category"])
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${
                    activeCategory === category
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <dl className="space-y-6">
            {faqs
              .filter((faq) => faq.category === activeCategory)
              .map((faq, index) => (
                <AnimatedElement
                  key={index}
                  animation="slideLeft"
                  delay={index * 0.1}
                >
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <dt className="text-lg">
                      <button
                        onClick={() =>
                          setOpenItem(openItem === index ? null : index)
                        }
                        className="text-left w-full flex justify-between items-center text-gray-900 font-medium"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-indigo-500 transition-transform
                            ${
                              openItem === index ? "transform rotate-180" : ""
                            }`}
                        />
                      </button>
                    </dt>
                    <dd
                      className={`mt-2 text-base text-gray-500 transition-all duration-200 ease-in-out
                        ${
                          openItem === index
                            ? "max-h-40 opacity-100"
                            : "max-h-0 opacity-0 overflow-hidden"
                        }`}
                    >
                      {faq.answer}
                    </dd>
                  </div>
                </AnimatedElement>
              ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
