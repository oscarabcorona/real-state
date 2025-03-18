import { Building2 } from "lucide-react";
import { LoginForm } from "@/pages/Login/login-form";

export function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="size-4" />
            </div>
            Real Estate Management
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-t from-muted to-muted/50" />
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
          alt="Modern apartment building"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      </div>
    </div>
  );
}
