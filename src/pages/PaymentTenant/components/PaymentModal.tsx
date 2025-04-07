import { Building2, CreditCard, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Payment } from "../types";
import { useTranslation } from "react-i18next";

type PaymentModalProps = {
  payment: Payment;
  open?: boolean; // Make open optional
  onClose: () => void;
  onProcessPayment: (method: "credit_card" | "ach" | "cash") => void;
};

export function PaymentModal({
  payment,
  open = false, // Provide default value
  onClose,
  onProcessPayment,
}: PaymentModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("paymentTenant.modal.paymentDetails")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid gap-2 text-sm">
                <div className="grid grid-cols-2">
                  <dt className="font-medium">
                    {t("paymentTenant.table.amount")}
                  </dt>
                  <dd>${payment?.amount.toLocaleString()}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">
                    {t("paymentTenant.table.property")}
                  </dt>
                  <dd>{payment?.properties.name}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">
                    {t("paymentTenant.table.invoice")}
                  </dt>
                  <dd>{payment?.invoice_number}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            <Button
              onClick={() => onProcessPayment("credit_card")}
              className="w-full"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {t("paymentTenant.filters.method_options.creditCard")}
            </Button>

            <Button
              variant="outline"
              onClick={() => onProcessPayment("ach")}
              className="w-full"
            >
              <Building2 className="mr-2 h-4 w-4" />
              {t("paymentTenant.filters.method_options.bankTransfer")}
            </Button>

            <Button
              variant="outline"
              onClick={() => onProcessPayment("cash")}
              className="w-full"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              {t("paymentTenant.filters.method_options.cash")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
