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
import { Home, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
    }
  }

  return (
    <section
      className="bg-gradient-to-b from-muted/50 to-background py-24 scroll-mt-16"
      id="contact"
    >
      <div className="container max-w-xl mx-auto px-4">
        <AnimatedElement animation="slideUp">
          <div className="text-center mb-12">
            <div className="flex justify-center gap-2">
              <Home className="h-10 w-10 text-primary" />
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight mt-4">
              Get Started Today
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you're looking to list your property or find your next
              home, we're here to help.
            </p>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="slideUp" delay={0.2}>
          <div className="bg-card rounded-xl border p-6 sm:p-8 shadow-sm">
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
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tenant" id="tenant" />
                            <Label htmlFor="tenant">Tenant</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="lessor" id="lessor" />
                            <Label htmlFor="lessor">Property Owner</Label>
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
                          <Input placeholder="Your name" {...field} />
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
                          <Input placeholder="your@email.com" {...field} />
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
                          <FormLabel>Number of Properties</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 1"
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
                          <FormLabel>Property Type</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Apartment, House"
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
                          <FormLabel>Desired Move-in Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                          <FormLabel>Monthly Budget</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 1500"
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
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  {role === "lessor" ? "List Your Property" : "Find Your Home"}
                </Button>
              </form>
            </Form>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}
