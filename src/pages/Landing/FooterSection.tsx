import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatedElement } from "../../components/animated/AnimatedElement";

const socialLinks = [
  {
    Icon: Twitter,
    label: "Twitter",
    href: "#twitter",
    color: "hover:text-blue-400",
  },
  {
    Icon: Facebook,
    label: "Facebook",
    href: "#facebook",
    color: "hover:text-blue-600",
  },
  {
    Icon: Instagram,
    label: "Instagram",
    href: "#instagram",
    color: "hover:text-pink-600",
  },
  {
    Icon: Linkedin,
    label: "LinkedIn",
    href: "#linkedin",
    color: "hover:text-blue-500",
  },
] as const;

const quickLinks = {
  Product: ["Features", "Pricing", "Security", "Roadmap"],
  Support: ["Help Center", "Documentation", "Contact", "API"],
} as const;

export function FooterSection() {
  return (
    <footer className="relative border-t bg-gradient-to-b from-background/50 via-background to-background dark:border-gray-800">
      <div className="container relative max-w-7xl mx-auto pt-16 pb-8 px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 mb-12">
          <AnimatedElement animation="slideRight">
            <Card className="bg-card/50 dark:bg-card/30 backdrop-blur relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/5 dark:via-primary/2" />
              <div className="relative p-8">
                <h3 className="text-2xl font-bold tracking-tight">
                  Stay ahead of the curve
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Get the latest property management insights delivered to your
                  inbox.
                </p>
                <form className="mt-6 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 bg-background/80 focus:bg-background transition-colors"
                    />
                  </div>
                  <Button className="group">
                    Subscribe
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </div>
            </Card>
          </AnimatedElement>

          <AnimatedElement
            animation="slideLeft"
            className="grid sm:grid-cols-2 gap-8"
          >
            {Object.entries(quickLinks).map(([title, items]) => (
              <div key={title}>
                <h3 className="font-semibold mb-6 text-lg">{title}</h3>
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </AnimatedElement>
        </div>

        <div className="pt-8 mt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Short<span className="text-primary">Stay</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {socialLinks.map(({ Icon, label, href, color }) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className={cn(
                    "group cursor-pointer hover:bg-background",
                    color
                  )}
                  asChild
                >
                  <a href={href} aria-label={label}>
                    <Icon className="h-4 w-4" />
                  </a>
                </Badge>
              ))}
            </div>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <a
                href="#privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy
              </a>
              <a href="#terms" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a
                href="#cookies"
                className="hover:text-primary transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ShortStay Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
