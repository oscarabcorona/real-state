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
  Clock,
  ArrowRight,
  DollarSign,
  User,
  Shield,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AnimatedElement } from "../../components/animated/AnimatedElement";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  role: z.enum(["lessor", "tenant"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  propertyCount: z.string().optional(),
  propertyType: z.string().optional(),
  moveInDate: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const benefits = [
  {
    lessor: {
      icon: DollarSign,
      text: "Reduce management costs by up to 40%",
    },
    tenant: {
      icon: Home,
      text: "Find your ideal property 3x faster",
    },
  },
  {
    lessor: {
      icon: Users,
      text: "Fill vacancies 64% faster",
    },
    tenant: {
      icon: Shield,
      text: "Simplified application process",
    },
  },
  {
    lessor: {
      icon: Clock,
      text: "Automate 85% of daily tasks",
    },
    tenant: {
      icon: MessageSquare,
      text: "24/7 maintenance request tracking",
    },
  },
  {
    lessor: {
      icon: Building2,
      text: "Increase rental income by 15-25%",
    },
    tenant: {
      icon: CreditCard,
      text: "Virtual tours and instant responses",
    },
  },
];

export function ContactSection() {
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "tenant",
    },
  });

  const role = form.watch("role");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingSlots, setRemainingSlots] = useState(7);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("contact_requests")
        .insert([values]);

      if (error) throw error;

      setRemainingSlots((prev) => Math.max(1, prev - 1));
      toast.success(t("contact.form.fields.success.message"));
      form.reset();
    } catch (error: unknown) {
      console.error("Error submitting contact form", error);
      toast.error(t("contact.form.fields.error"));
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
                  {t("contact.badge")}
                </span>
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                {t("contact.title")}
              </h2>

              <p className="text-lg text-muted-foreground max-w-lg mb-8">
                {t("contact.subtitle")}
              </p>

              {/* Benefits section */}
              <div className="space-y-5 mb-10">
                <h3 className="text-xl font-semibold">
                  {t(`contact.benefits.${role}.title`)}
                </h3>
                <div className="grid gap-4">
                  {benefits.map((benefit, index) => {
                    const currentBenefit =
                      role === "lessor" ? benefit.lessor : benefit.tenant;
                    const Icon = currentBenefit.icon;

                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {t(`contact.benefits.${role}.items.${index}.text`)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact information */}
              <div className="space-y-4 mb-12">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {t("contact.contactInfo.phone.title")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.contactInfo.phone.value")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {t("contact.contactInfo.email.title")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.contactInfo.email.value")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Success stories */}
              <AnimatedElement animation="fadeIn" delay={0.3}>
                <div className="relative bg-card/50 backdrop-blur-sm dark:bg-card/20 p-6 rounded-2xl border border-muted/60">
                  <div className="absolute -top-3 -right-3 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p className="italic text-muted-foreground mb-4">
                    {t("contact.testimonial.quote")}
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/20 mr-3 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {t("contact.testimonial.author.name")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("contact.testimonial.author.role")}
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
                {/* Remaining slots indicator */}
                <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                      {t("contact.form.subtitle", { count: remainingSlots })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-semibold text-foreground">
                    {t("contact.form.title")}
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
                          <FormLabel>
                            {t("contact.form.fields.role.label")}
                          </FormLabel>
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
                                      {t(
                                        "contact.form.fields.role.options.tenant"
                                      )}
                                    </Label>
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
                                      {t(
                                        "contact.form.fields.role.options.lessor"
                                      )}
                                    </Label>
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
                            <FormLabel>
                              {t("contact.form.fields.name.label")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t(
                                  "contact.form.fields.name.placeholder"
                                )}
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
                            <FormLabel>
                              {t("contact.form.fields.email.label")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t(
                                  "contact.form.fields.email.placeholder"
                                )}
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
                                <span>
                                  {t("contact.form.fields.propertyCount.label")}
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={t(
                                    "contact.form.fields.propertyCount.placeholder"
                                  )}
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
                                <span>
                                  {t("contact.form.fields.propertyType.label")}
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t(
                                    "contact.form.fields.propertyType.placeholder"
                                  )}
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
                                <span>
                                  {t("contact.form.fields.moveInDate.label")}
                                </span>
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
                                <span>
                                  {t("contact.form.fields.budget.label")}
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={t(
                                    "contact.form.fields.budget.placeholder"
                                  )}
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
                          <FormLabel>
                            {t("contact.form.fields.message.label")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t(
                                `contact.form.fields.message.placeholder.${role}`
                              )}
                              className="min-h-[120px] bg-muted/40"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full py-6 text-base font-medium shadow-lg hover:shadow-xl transition-shadow"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("contact.form.fields.submit.loading")}
                        </>
                      ) : (
                        <>
                          {t(`contact.form.fields.submit.${role}`)}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <p>{t("pricing.common.trialNote")}</p>
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
