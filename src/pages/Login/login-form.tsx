import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Key, Mail, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"lessor" | "tenant" | "">("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!role) {
          throw new Error("Please select a role");
        }
        await signUp(email, password, role);
      }
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : isSignUp
          ? "Failed to create account"
          : "Invalid email or password";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isSignUp
            ? "Join our property management platform"
            : "Sign in to continue to your account"}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute left-3 top-2.5 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            icon={<Key className="h-4 w-4" />}
          />
        </div>

        {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label>I am a...</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={() => setRole("lessor")}
                variant={role === "lessor" ? "default" : "outline"}
                className="relative flex flex-col items-center justify-center p-4 h-auto"
              >
                <Building2 className="h-6 w-6 mb-2" />
                <span className="text-sm">Property Owner</span>
              </Button>
              <Button
                type="button"
                onClick={() => setRole("tenant")}
                variant={role === "tenant" ? "default" : "outline"}
                className="relative flex flex-col items-center justify-center p-4 h-auto"
              >
                <User className="h-6 w-6 mb-2" />
                <span className="text-sm">Tenant</span>
              </Button>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isLoading || (isSignUp && !role)}>
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {isSignUp ? "Create Account" : "Sign In"}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background text-muted-foreground px-2 text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        disabled={isLoading}
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError("");
          setRole("");
        }}
      >
        {isSignUp ? "Sign in instead" : "Create an account"}
      </Button>
    </div>
  );
}
