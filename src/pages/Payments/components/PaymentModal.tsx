import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePaymentForm } from "@/hooks/usePayment";

interface PaymentModalProps {
  formData: {
    property_id: string;
    amount: string;
    payment_method: "credit_card" | "ach" | "cash";
    description: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      property_id: string;
      amount: string;
      payment_method: "credit_card" | "ach" | "cash";
      description: string;
    }>
  >;
  handleSubmit: (e: React.FormEvent) => Promise<boolean | void>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  formData,
  setFormData,
  handleSubmit,
  setIsModalOpen,
  loading,
}) => {
  const { propertiesWithTenants } = usePaymentForm();
  const hasNoPropertiesWithTenants = propertiesWithTenants.length === 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await handleSubmit(e);
      if (result) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
    }
  };

  const isFormValid =
    formData.property_id &&
    formData.amount &&
    parseFloat(formData.amount) > 0 &&
    formData.payment_method;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="min-h-[200px] w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>New Payment</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {hasNoPropertiesWithTenants ? (
              <div className="mb-4 p-4 border border-yellow-300 bg-yellow-50 rounded-md text-yellow-800">
                <p className="font-medium">No eligible properties found</p>
                <p className="text-sm mt-1">
                  You must have properties with active tenants to create
                  payments. Please assign tenants to your properties first.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="font-medium">
                    Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className={cn(
                        "pl-6",
                        parseFloat(formData.amount || "0") <= 0 &&
                          "border-red-500"
                      )}
                      placeholder="0.00"
                      required
                      min="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method" className="font-medium">
                    Payment Method
                  </Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value: "credit_card" | "ach" | "cash") =>
                      setFormData({ ...formData, payment_method: value })
                    }
                    required
                  >
                    <SelectTrigger id="payment_method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertiesWithTenants.map((property) => (
                        <SelectItem
                          key={property.property_id}
                          value={property.property_id}
                        >
                          {property.property_name}
                          {/* {property.user_role === "lessor" && (
                            <span className="text-gray-500 text-sm ml-1">
                              ({property.tenant_count} tenant
                              {property.tenant_count !== 1 ? "s" : ""})
                            </span>
                          )} */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Payment description (optional)"
                    rows={3}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !isFormValid}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      "Create Payment"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
