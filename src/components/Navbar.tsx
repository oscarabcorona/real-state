import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Building2, Menu, MessagesSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";

const navigation = [
  { name: "Features", href: "#features", icon: Building2 },
  { name: "Pricing", href: "#pricing", icon: Building2 },
  { name: "Contact", href: "#contact", icon: MessagesSquare },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

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
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="relative flex items-center gap-2 text-xl font-bold transition-transform hover:scale-105"
          >
            <div className="relative size-8 overflow-hidden rounded-lg bg-primary">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground opacity-80" />
              <span className="relative z-10 flex h-full items-center justify-center text-primary-foreground">
                S
              </span>
            </div>
            <span
              className={cn(
                "transition-colors",
                isScrolled ? "text-foreground" : "text-white"
              )}
            >
              ShortStay
            </span>
          </a>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:gap-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative px-3 py-2 text-sm font-medium transition-all duration-300 ease-out hover:-translate-y-0.5",
                  isScrolled
                    ? "text-foreground hover:text-primary"
                    : "text-white hover:text-white",
                  activeSection === item.href.replace("#", "") && "text-primary"
                )}
              >
                {item.name}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 ease-out",
                    "group-hover:scale-x-100",
                    activeSection === item.href.replace("#", "") &&
                      "scale-x-100"
                  )}
                />
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <div className="hidden md:flex md:gap-2">
            <Button
              variant={isScrolled ? "outline" : "secondary"}
              size="sm"
              className="transition-all duration-300 hover:scale-105"
            >
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={isScrolled ? "outline" : "secondary"}
                  size="icon"
                  className="size-8"
                >
                  <Menu className="size-4" />
                  <span className="sr-only">Toggle menu</span>
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
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <item.icon className="size-4" />
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-col gap-2 pt-6">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      Sign in
                    </Button>
                    <Button className="w-full justify-start gap-2">
                      Get Started
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
