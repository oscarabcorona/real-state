import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Building2, Globe, Menu, MessagesSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "nav.features", href: "#features", icon: Building2 },
  { name: "nav.pricing", href: "#pricing", icon: Building2 },
  { name: "nav.contact", href: "#contact", icon: MessagesSquare },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);

      // Reset to home when at the top of the page
      if (scrollPosition < 100) {
        setActiveSection("home");
        return;
      }

      // Update active section based on scroll position
      const sections = navigation.map((n) => n.href.replace("#", ""));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element && element.getBoundingClientRect().top <= 100) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500 backdrop-blur-sm",
        isScrolled
          ? "bg-background/80 border-b shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <a
            href="#"
            className="relative flex items-center gap-2.5 text-xl font-bold transition-all duration-300 hover:scale-105 hover:opacity-90"
          >
            <div className="relative size-9 overflow-hidden rounded-xl bg-primary shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
              <span className="relative z-10 flex h-full items-center justify-center text-lg font-bold text-primary-foreground">
                S
              </span>
            </div>
            <span
              className={cn(
                "transition-all duration-300",
                isScrolled ? "text-foreground" : "text-white"
              )}
            >
              ShortStay
            </span>
          </a>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:gap-6">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative px-3 py-2 text-sm font-medium transition-all duration-300",
                  isScrolled
                    ? "text-foreground/80 hover:text-primary"
                    : "text-white/90 hover:text-white",
                  activeSection === item.href.replace("#", "") &&
                    "text-primary font-semibold"
                )}
              >
                <span className="relative transition-all duration-300 group-hover:-translate-y-0.5 inline-block">
                  {t(item.name)}
                </span>
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-primary transition-all duration-300 ease-out",
                    "group-hover:scale-x-100 group-hover:opacity-100",
                    activeSection === item.href.replace("#", "")
                      ? "scale-x-100 opacity-100"
                      : "opacity-0"
                  )}
                />
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2 px-3 transition-all duration-300",
                  isScrolled
                    ? "text-foreground/80 hover:text-primary hover:bg-primary/10"
                    : "text-white/90 hover:text-white hover:bg-white/10",
                  "hover:scale-105"
                )}
              >
                <Globe className="size-4 transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-sm font-medium">
                  {i18n.language === "en" ? "EN" : "ES"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => changeLanguage("en")}
                className={cn(
                  "flex items-center gap-2 transition-colors duration-300",
                  "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary",
                  i18n.language === "en" && "bg-accent"
                )}
              >
                {t("common.english")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeLanguage("es")}
                className={cn(
                  "flex items-center gap-2 transition-colors duration-300",
                  "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary",
                  i18n.language === "es" && "bg-accent"
                )}
              >
                {t("common.spanish")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle
            className={cn(
              "transition-all duration-300 hover:scale-105",
              isScrolled
                ? "text-foreground/80 hover:text-primary hover:bg-primary/10"
                : "text-white/90 hover:text-white hover:bg-white/10"
            )}
          />

          <div className="hidden md:flex md:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-all duration-300 hover:scale-105",
                isScrolled
                  ? "text-foreground/80 hover:text-primary hover:bg-primary/10"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              <Link to="/login">{t("nav.signIn")}</Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:opacity-90 shadow-md"
            >
              <Link to="/register">{t("nav.getStarted")}</Link>
            </Button>
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={isScrolled ? "outline" : "secondary"}
                  size="icon"
                  className="size-9 transition-all duration-300 hover:scale-105"
                >
                  <Menu className="size-5 transition-transform duration-300 hover:rotate-12" />
                  <span className="sr-only">{t("nav.toggleMenu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[80vw] p-0 sm:w-[385px] backdrop-blur-md bg-background/95"
              >
                <div className="flex h-full flex-col gap-2 p-6">
                  <div className="flex flex-col gap-1">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <item.icon className="size-4 transition-transform duration-300 group-hover:rotate-12" />
                        {t(item.name)}
                      </a>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-col gap-2 pt-6">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                    >
                      {t("nav.signIn")}
                    </Button>
                    <Button className="w-full justify-center gap-2 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:opacity-90">
                      {t("nav.getStarted")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
