import React from "react";
import { X } from "lucide-react";
import { Property } from "../types";
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
  properties: Property[];
  handleSubmit: (e: React.FormEvent) => Promise<boolean | void>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  formData,
  setFormData,
  properties,
  handleSubmit,
  setIsModalOpen,
  loading,
}) => {
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
            <form onSubmit={onSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="property" className="font-medium">
                  Property
                </Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, property_id: value })
                  }
                  required
                >
                  <SelectTrigger id="property">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="ach">ACH Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
