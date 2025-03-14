import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  BarChart, 
  Building2,
  Shield,
  Brain,
  FileCheck,
  Users,
  Clock,
  Bot,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Mail,
  MessageSquare,
  Phone,
  Globe,
  Award,
  Heart
} from 'lucide-react';
import { animate, stagger, inView } from 'motion';
import { AnimatedElement } from '../components/AnimatedElement';
import { AnimatedText } from '../components/AnimatedText';
import { AnimatedNumber } from '../components/AnimatedNumber';

export function Landing() {
  useEffect(() => {
    // Animate stats on scroll
    const statsElements = document.querySelectorAll('.stat-number');
    statsElements.forEach(element => {
      inView(element, () => {
        const target = element as HTMLElement;
        const value = parseInt(target.dataset.value || '0');
        animate(0, value, {
          duration: 1.5,
          onUpdate: latest => {
            target.textContent = Math.round(latest).toLocaleString();
          }
        });
      });
    });

    // Animate logos on scroll
    const logos = document.querySelectorAll('.company-logo');
    inView('.logos-container', () => {
      animate(
        logos,
        { opacity: [0, 1], scale: [0.8, 1] },
        { delay: stagger(0.1), duration: 0.5 }
      );
    });
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
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
                  <AnimatedText text="Revolutionizing" delay={0.5} />
                  <span className="block text-indigo-200">
                    <AnimatedText text="Property Management" delay={0.8} />
                  </span>
                </h1>
              </AnimatedElement>

              <AnimatedElement animation="slideUp" delay={1}>
                <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
                  Transform your property management experience with our AI-powered platform. Streamline operations, ensure compliance, and boost efficiency—all in one place.
                </p>
              </AnimatedElement>

              <AnimatedElement animation="slideUp" delay={1.2}>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    to="/login"
                    className="rounded-md bg-indigo-500 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                  >
                    Get Started
                  </Link>
                  <a href="#features" className="text-lg font-semibold leading-6 text-white">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </AnimatedElement>

              <div className="mt-8 grid grid-cols-3 gap-4 items-center">
                <AnimatedElement animation="scale" delay={1.4}>
                  <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <AnimatedNumber value={99} suffix="%" className="text-3xl font-bold text-white" />
                    <span className="text-sm text-indigo-200">Accuracy Rate</span>
                  </div>
                </AnimatedElement>

                <AnimatedElement animation="scale" delay={1.6}>
                  <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <AnimatedNumber value={50000} suffix="+" className="text-3xl font-bold text-white" />
                    <span className="text-sm text-indigo-200">Properties Managed</span>
                  </div>
                </AnimatedElement>

                <AnimatedElement animation="scale" delay={1.8}>
                  <div className="flex flex-col items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span className="text-3xl font-bold text-white">24/7</span>
                    <span className="text-sm text-indigo-200">AI Support</span>
                  </div>
                </AnimatedElement>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="slideUp">
            <div className="lg:text-center">
              <h2 className="text-base font-semibold tracking-wide text-indigo-600 uppercase">Why Choose Us</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                The Smart Way to Manage Properties
              </p>
            </div>
          </AnimatedElement>

          <div className="mt-20">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <AnimatedElement animation="slideLeft" delay={0.2}>
                <div className="relative bg-white p-6 rounded-xl shadow-md">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white -top-6">
                      <Brain className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg font-medium text-gray-900">AI-Powered Insights</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Our advanced AI analyzes market trends, tenant behavior, and property performance to provide actionable insights.
                  </dd>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="slideLeft" delay={0.4}>
                <div className="relative bg-white p-6 rounded-xl shadow-md">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white -top-6">
                      <Shield className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg font-medium text-gray-900">Enhanced Security</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Bank-level encryption and advanced fraud detection keep your data and transactions secure.
                  </dd>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="slideLeft" delay={0.6}>
                <div className="relative bg-white p-6 rounded-xl shadow-md">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white -top-6">
                      <Bot className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg font-medium text-gray-900">24/7 Support</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    AI-powered chatbot and human support team available around the clock to assist you.
                  </dd>
                </div>
              </AnimatedElement>
            </dl>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="slideUp">
            <div className="lg:text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900">Trusted by Industry Leaders</h2>
            </div>
          </AnimatedElement>

          <div className="logos-container grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
            <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
              <img className="h-12 company-logo opacity-0" src="https://tailwindui.com/img/logos/tuple-logo-gray-400.svg" alt="Tuple" />
            </div>
            <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
              <img className="h-12 company-logo opacity-0" src="https://tailwindui.com/img/logos/mirage-logo-gray-400.svg" alt="Mirage" />
            </div>
            <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
              <img className="h-12 company-logo opacity-0" src="https://tailwindui.com/img/logos/statickit-logo-gray-400.svg" alt="StaticKit" />
            </div>
            <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
              <img className="h-12 company-logo opacity-0" src="https://tailwindui.com/img/logos/transistor-logo-gray-400.svg" alt="Transistor" />
            </div>
            <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
              <img className="h-12 company-logo opacity-0" src="https://tailwindui.com/img/logos/workcation-logo-gray-400.svg" alt="Workcation" />
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <AnimatedElement animation="slideUp" delay={0.2}>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="Sarah Wilson"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold">Sarah Wilson</h4>
                      <p className="text-gray-500">Property Manager</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    "The AI-powered insights have transformed how we manage properties. We've seen a 40% increase in efficiency."
                  </p>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="slideUp" delay={0.4}>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="Tom Anderson"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold">Tom Anderson</h4>
                      <p className="text-gray-500">Real Estate Investor</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    "The automated compliance checks have saved us countless hours and helped us avoid potential issues."
                  </p>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="slideUp" delay={0.6}>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full"
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="Emily Chen"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold">Emily Chen</h4>
                      <p className="text-gray-500">Property Owner</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    "The tenant screening process is now seamless and much more reliable with AI-powered background checks."
                  </p>
                </div>
              </AnimatedElement>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="slideUp">
            <div className="lg:text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900">Meet Our Team</h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Experts in property management, technology, and customer service.
              </p>
            </div>
          </AnimatedElement>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            <AnimatedElement animation="slideUp" delay={0.2}>
              <div className="space-y-4 text-center">
                <img
                  className="mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56"
                  src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
                  alt=""
                />
                <div className="space-y-2">
                  <div className="text-lg leading-6 font-medium space-y-1">
                    <h3>Michael Foster</h3>
                    <p className="text-indigo-600">CEO & Co-Founder</p>
                  </div>
                  <p className="text-gray-500">15+ years in PropTech</p>
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideUp" delay={0.4}>
              <div className="space-y-4 text-center">
                <img
                  className="mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56"
                  src="https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
                  alt=""
                />
                <div className="space-y-2">
                  <div className="text-lg leading-6 font-medium space-y-1">
                    <h3>Lindsay Wang</h3>
                    <p className="text-indigo-600">CTO</p>
                  </div>
                  <p className="text-gray-500">AI & Machine Learning Expert</p>
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideUp" delay={0.6}>
              <div className="space-y-4 text-center">
                <img
                  className="mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56"
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
                  alt=""
                />
                <div className="space-y-2">
                  <div className="text-lg leading-6 font-medium space-y-1">
                    <h3>David Martinez</h3>
                    <p className="text-indigo-600">Head of Customer Success</p>
                  </div>
                  <p className="text-gray-500">Property Management Specialist</p>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="slideUp">
            <div className="lg:text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900">Simple, Transparent Pricing</h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Choose the plan that best fits your needs
              </p>
            </div>
          </AnimatedElement>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <AnimatedElement animation="slideUp" delay={0.2}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-8">
                  <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                  <p className="mt-4 text-gray-500">Perfect for small property owners</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">$29</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">Up to 5 properties</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">Basic AI insights</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">Email support</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 py-8 bg-gray-50">
                  <Link
                    to="/login"
                    className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideUp" delay={0.4}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-indigo-500">
                <div className="px-6 py-8">
                  <h3 className="text-2xl font-bold text-gray-900">Professional</h3>
                  <p className="mt-4 text-gray-500">For growing property businesses</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">$99</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">Up to 50 properties</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">Advanced AI analytics</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">Custom reports</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 py-8 bg-gray-50">
                  <Link
                    to="/login"
                    className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideUp" delay={0.6}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-8">
                  <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                  <p className="mt-4 text-gray-500">For large organizations</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">Custom</span>
                  </p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">Unlimited properties</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">Custom AI models</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">24/7 dedicated support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="ml-3 text-gray-500">API access</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 py-8 bg-gray-50">
                  <Link
                    to="/contact"
                    className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="slideUp">
            <div className="lg:text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
            </div>
          </AnimatedElement>

          <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200">
            <dl className="space-y-6 divide-y divide-gray-200">
              <AnimatedElement animation="slideLeft" delay={0.2}>
                <div className="pt-6">
                  <dt className="text-lg">
                    <button className="text-left w-full flex justify-between items-start text-gray-400">
                      <span className="font-medium text-gray-900">
                        How does the AI-powered screening work?
                      </span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      Our AI system analyzes multiple data points including credit history, background checks, and rental history to provide comprehensive screening reports with 99% accuracy.
                    </p>
                  </dd>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="slideLeft" delay={0.4}>
                <div className="pt-6">
                  <dt className="text-lg">
                    <button className="text-left w-full flex justify-between items-start text-gray-400">
                      <span className="font-medium text-gray-900">
                        What security measures are in place?
                      </span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      We use bank-level encryption, two-factor authentication, and regular security audits to ensure your data is always protected.
                    </p>
                  </dd>
                </div>
              </AnimatedElement>

              <AnimatedElement animation="slideLeft" delay={0.6}>
                <div className="pt-6">
                  <dt className="text-lg">
                    <button className="text-left w-full flex justify-between items-start text-gray-400">
                      <span className="font-medium text-gray-900">
                        Can I integrate with existing systems?
                      </span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      Yes, our platform offers API integration with major property management systems and accounting software.
                    </p>
                  </dd>
                </div>
              </AnimatedElement>
            </dl>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="slideUp">
            <div className="lg:text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900">Get in Touch</h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Have questions? Our team is here to help
              </p>
            </div>
          </AnimatedElement>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <AnimatedElement animation="slideUp" delay={0.2}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Phone Support</h3>
                </div>
                <p className="mt-4 text-gray-500">
                  Mon-Fri: 9AM - 6PM EST<br />
                  +1 (555) 123-4567
                </p>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideUp" delay={0.4}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Email</h3>
                </div>
                <p className="mt-4 text-gray-500">
                  support@shortstay.com<br />
                  sales@shortstay.com
                </p>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="slideUp" delay={0.6}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Live Chat</h3>
                </div>
                <p className="mt-4 text-gray-500">
                  24/7 AI Chat Support<br />
                  Human Support: 9AM - 6PM EST
                </p>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-200">Join thousands of property managers today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#features" className="text-base text-gray-300 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-base text-gray-300 hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#security" className="text-base text-gray-300 hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#about" className="text-base text-gray-300 hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#team" className="text-base text-gray-300 hover:text-white">
                    Team
                  </a>
                </li>
                <li>
                  <a href="#careers" className="text-base text-gray-300 hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#help" className="text-base text-gray-300 hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#docs" className="text-base text-gray-300 hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-base text-gray-300 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#privacy" className="text-base text-gray-300 hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-base text-gray-300 hover:text-white">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              © 2024 ShortStay Hub. All rights reserved. Powered by advanced AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}