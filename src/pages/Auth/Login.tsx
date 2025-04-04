import { ArrowLeft, Building2 } from "lucide-react";
import { AuthContainer } from "@/pages/Login/auth-container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-10">
        <div className="flex justify-center md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="size-4" />
            </div>
            Real Estate Management
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center mt-8">
          <div className="w-full max-w-sm">
            <AuthContainer view="sign_in" />
          </div>
        </div>

        <div className="mt-8 md:mt-6 flex justify-center md:justify-start">
          <Button
            variant="ghost"
            asChild
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              <span>Back to home</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
          alt="Modern apartment building"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
