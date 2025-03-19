import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Home,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  Calendar,
  CreditCard,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

const formSchema = z.object({
  role: z.enum(["lessor", "tenant"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  propertyCount: z.string().optional(),
  propertyType: z.string().optional(),
  moveInDate: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export function ContactSection() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "tenant",
    },
  });

  const role = form.watch("role");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("contact_requests")
        .insert([values]);

      if (error) throw error;

      toast.success("Thanks for reaching out! We'll be in touch soon.");
      form.reset();
    } catch (error: unknown) {
      console.error("Error submitting contact form", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="relative bg-gradient-to-b from-muted/30 to-background py-28 scroll-mt-16 overflow-hidden"
      id="contact"
    >
      {/* Enhanced background with subtle patterns */}
      <div className="absolute inset-0 bg-grid-gray-100/40 dark:bg-grid-gray-800/20 bg-[size:24px_24px] [mask-image:radial-gradient(white,transparent_90%)]" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-5 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container relative max-w-6xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left column - Content */}
          <div className="lg:pr-8">
            <AnimatedElement animation="slideUp">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 mb-6">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Let's Connect
                </span>
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                Get Started Today
              </h2>

              <p className="text-lg text-muted-foreground max-w-lg mb-8">
                Whether you're looking to list your property or find your next
                home, our team is ready to help you every step of the way.
              </p>

              {/* Added contact information */}
              <div className="space-y-4 mb-12">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p className="text-sm text-muted-foreground">
                      contact@propertyai.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p className="text-sm text-muted-foreground">
                      (555) 123-4567
                    </p>
                  </div>
                </div>
              </div>

              {/* Added testimonial box */}
              <AnimatedElement animation="fadeIn" delay={0.3}>
                <div className="relative bg-card/50 backdrop-blur-sm dark:bg-card/20 p-6 rounded-2xl border border-muted/60">
                  <div className="absolute -top-3 -right-3 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p className="italic text-muted-foreground mb-4">
                    "The team responded to my inquiry within hours and helped me
                    find the perfect property that matched all my requirements."
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/20 mr-3"></div>
                    <div>
                      <p className="font-medium">Michael Johnson</p>
                      <p className="text-xs text-muted-foreground">
                        New tenant, joined 2023
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedElement>
            </AnimatedElement>
          </div>

          {/* Right column - Form */}
          <AnimatedElement animation="slideUp" delay={0.2}>
            <div className="mt-12 lg:mt-0">
              <div className="bg-card rounded-2xl border shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-semibold text-foreground">
                    Contact Us
                  </h3>
                  <div className="flex gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>I am a...</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-4"
                            >
                              <div className="flex-1">
                                <div
                                  className={`flex items-center gap-3 p-4 rounded-xl border border-muted cursor-pointer transition-colors ${
                                    field.value === "tenant"
                                      ? "bg-primary/10 border-primary/50"
                                      : "hover:bg-muted/50"
                                  }`}
                                  onClick={() =>
                                    form.setValue("role", "tenant")
                                  }
                                >
                                  <RadioGroupItem value="tenant" id="tenant" />
                                  <div>
                                    <Label
                                      htmlFor="tenant"
                                      className="text-base font-medium"
                                    >
                                      Tenant
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      Looking for a property
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div
                                  className={`flex items-center gap-3 p-4 rounded-xl border border-muted cursor-pointer transition-colors ${
                                    field.value === "lessor"
                                      ? "bg-primary/10 border-primary/50"
                                      : "hover:bg-muted/50"
                                  }`}
                                  onClick={() =>
                                    form.setValue("role", "lessor")
                                  }
                                >
                                  <RadioGroupItem value="lessor" id="lessor" />
                                  <div>
                                    <Label
                                      htmlFor="lessor"
                                      className="text-base font-medium"
                                    >
                                      Property Owner
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      Looking to list property
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your name"
                                className="bg-muted/40"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your@email.com"
                                className="bg-muted/40"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {role === "lessor" ? (
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="propertyCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                <Home className="h-4 w-4 text-primary opacity-70" />
                                <span>Number of Properties</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g. 1"
                                  className="bg-muted/40"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="propertyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                <Building2 className="h-4 w-4 text-primary opacity-70" />
                                <span>Property Type</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Apartment, House"
                                  className="bg-muted/40"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="moveInDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-primary opacity-70" />
                                <span>Desired Move-in Date</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="bg-muted/40"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4 text-primary opacity-70" />
                                <span>Monthly Budget</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g. 1500"
                                  className="bg-muted/40"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How can we help?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your property management needs and challenges..."
                              className="min-h-[120px] bg-muted/40"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full py-6 text-base font-medium shadow-lg hover:shadow-xl transition-shadow"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : role === "lessor" ? (
                          "List Your Property"
                        ) : (
                          "Find Your Home"
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground mt-3">
                        By submitting this form, you agree to our{" "}
                        <a
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </a>
                        .
                      </p>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
}
