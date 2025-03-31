import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
  Shield,
  Users,
  Star,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { useTranslation } from "react-i18next";

const socialLinks = [
  {
    Icon: Twitter,
    key: "twitter",
    href: "#twitter",
    color: "hover:text-blue-400",
  },
  {
    Icon: Facebook,
    key: "facebook",
    href: "#facebook",
    color: "hover:text-blue-600",
  },
  {
    Icon: Instagram,
    key: "instagram",
    href: "#instagram",
    color: "hover:text-pink-600",
  },
  {
    Icon: Linkedin,
    key: "linkedin",
    href: "#linkedin",
    color: "hover:text-blue-500",
  },
] as const;

export function FooterSection() {
  const { t } = useTranslation();

  return (
    <footer className="relative border-t bg-gradient-to-b from-background/50 via-background to-background dark:border-gray-800">
      <div className="container relative max-w-7xl mx-auto pt-16 pb-8 px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 mb-12">
          <AnimatedElement animation="slideRight">
            <Card className="bg-card/50 dark:bg-card/30 backdrop-blur relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/5 dark:via-primary/2" />
              <div className="relative p-8">
                <h3 className="text-2xl font-bold tracking-tight">
                  {t("footer.newsletter.title")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {t("footer.newsletter.description")}
                </p>
                <form className="mt-6 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t("footer.newsletter.placeholder")}
                      className="pl-10 bg-background/80 focus:bg-background transition-colors"
                    />
                  </div>
                  <Button className="group">
                    {t("footer.newsletter.button")}
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
            <div>
              <h3 className="font-semibold mb-6 text-lg">
                {t("footer.product.title")}
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.product.features")}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.product.pricing")}
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.product.security")}
                  </a>
                </li>
                <li>
                  <a
                    href="#enterprise"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.product.enterprise")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">
                {t("footer.resources.title")}
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#documentation"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.resources.documentation")}
                  </a>
                </li>
                <li>
                  <a
                    href="#guides"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.resources.guides")}
                  </a>
                </li>
                <li>
                  <a
                    href="#support"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.resources.support")}
                  </a>
                </li>
                <li>
                  <a
                    href="#api"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("footer.resources.api")}
                  </a>
                </li>
              </ul>
            </div>
          </AnimatedElement>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 items-center py-6 border-y mb-8">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {t("footer.trust.encryption")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {t("footer.trust.customers")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {t("footer.trust.rating")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {t("footer.trust.award")}
            </span>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Real<span className="text-primary">State</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {socialLinks.map(({ Icon, key, href, color }) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className={cn(
                    "group cursor-pointer hover:bg-background",
                    color
                  )}
                  asChild
                >
                  <a href={href} aria-label={t(`footer.social.${key}`)}>
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
                {t("footer.legal.privacy")}
              </a>
              <a href="#terms" className="hover:text-primary transition-colors">
                {t("footer.legal.terms")}
              </a>
              <a
                href="#cookies"
                className="hover:text-primary transition-colors"
              >
                {t("footer.legal.cookies")}
              </a>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("footer.copyright.text")}
          </p>
        </div>
      </div>
    </footer>
  );
}
