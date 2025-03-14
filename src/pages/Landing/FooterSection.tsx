import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="pb-8 mb-8 border-b border-gray-700">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Stay updated with property management insights
            </h3>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Logo and Social Links */}
          <div className="col-span-2 lg:col-span-1">
            <h1 className="text-2xl font-bold text-white mb-4">
              Short<span className="text-indigo-400">Stay</span>
            </h1>
            <div className="flex space-x-4 text-gray-400">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "#" },
                { Icon: Instagram, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="hover:text-indigo-400 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Menu Columns */}
          <div>
            <h3 className="text-sm font-semibold text-indigo-400 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="#features"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="#about"
                  className="text-base text-gray-300 hover:text-white"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#team"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Team
                </a>
              </li>
              <li>
                <a
                  href="#careers"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="#help"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#docs"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="#privacy"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 ShortStay Hub. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#privacy"
                className="text-sm text-gray-400 hover:text-white"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-sm text-gray-400 hover:text-white"
              >
                Terms of Service
              </a>
              <a
                href="#cookies"
                className="text-sm text-gray-400 hover:text-white"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
