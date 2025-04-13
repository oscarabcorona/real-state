import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  XCircle,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Payment } from "./types";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "./utils";
import { getPaymentMethodIcon, statuses } from "./components/table/columns";
import { useTranslation } from "react-i18next";

// Function to generate mock payment data based on the ID
const getMockPayment = (id: string): Payment => {
  // Use the last character of the ID to determine the payment variant
  const lastChar = id.slice(-1);
  const variant = parseInt(lastChar, 16) % 14; // 0-13 variants (added 5 more variants)

  // Base payment properties
  const basePayment: Payment = {
    id: id,
    amount: 1200.0,
    status: "completed",
    payment_method: "credit_card",
    description: "Monthly rent payment",
    created_at: new Date().toISOString(),
    property_id: "prop123",
    user_id: "user123",
    properties: {
      name: "Woodland Apartments #203",
    },
  };

  // Different variants based on the variant number
  switch (variant) {
    case 0: // Completed credit card payment
      return {
        ...basePayment,
        amount: 1250.0,
        status: "completed",
        payment_method: "credit_card",
        description: "Monthly rent payment for June 2023",
        created_at: "2023-06-01T10:15:30Z",
        properties: { name: "Woodland Apartments #203" },
      };
    case 1: // Pending credit card payment
      return {
        ...basePayment,
        amount: 1275.0,
        status: "pending",
        payment_method: "credit_card",
        description: "Monthly rent payment for July 2023",
        created_at: "2023-07-01T09:45:22Z",
        properties: { name: "Woodland Apartments #203" },
      };
    case 2: // Failed credit card payment
      return {
        ...basePayment,
        amount: 1250.0,
        status: "failed",
        payment_method: "credit_card",
        description: "Failed payment attempt - insufficient funds",
        created_at: "2023-07-03T14:22:15Z",
        properties: { name: "Woodland Apartments #203" },
      };
    case 3: // Completed ACH payment
      return {
        ...basePayment,
        amount: 1300.0,
        status: "completed",
        payment_method: "ach",
        description: "Monthly rent payment via bank transfer",
        created_at: "2023-08-02T08:30:45Z",
        properties: { name: "Sunset Gardens #105" },
      };
    case 4: // Pending ACH payment
      return {
        ...basePayment,
        amount: 1300.0,
        status: "pending",
        payment_method: "ach",
        description: "Monthly rent payment - processing",
        created_at: "2023-09-01T10:05:12Z",
        properties: { name: "Sunset Gardens #105" },
      };
    case 5: // Failed ACH payment
      return {
        ...basePayment,
        amount: 1300.0,
        status: "failed",
        payment_method: "ach",
        description: "Failed payment - invalid account information",
        created_at: "2023-09-03T16:45:30Z",
        properties: { name: "Sunset Gardens #105" },
      };
    case 6: // Completed cash payment
      return {
        ...basePayment,
        amount: 950.0,
        status: "completed",
        payment_method: "cash",
        description: "Monthly rent payment - cash at office",
        created_at: "2023-10-01T15:20:10Z",
        properties: { name: "Oakwood Residences #307" },
      };
    case 7: // Security deposit - completed
      return {
        ...basePayment,
        amount: 2500.0,
        status: "completed",
        payment_method: "credit_card",
        description: "Security deposit for new lease",
        created_at: "2023-05-15T11:10:05Z",
        properties: { name: "Woodland Apartments #203" },
      };
    case 8: // Late fee payment - completed
      return {
        ...basePayment,
        amount: 75.0,
        status: "completed",
        payment_method: "credit_card",
        description: "Late fee for June 2023 rent",
        created_at: "2023-06-10T09:35:22Z",
        properties: { name: "Woodland Apartments #203" },
      };
    case 9: // PayPal payment - completed
      return {
        ...basePayment,
        amount: 1250.0,
        status: "completed",
        payment_method: "paypal",
        description: "Monthly rent payment via PayPal",
        created_at: "2024-03-15T09:22:11Z",
        properties: { name: "Woodland Apartments #203" },
      };
    case 10: // PayPal payment - pending
      return {
        ...basePayment,
        amount: 1400.0,
        status: "pending",
        payment_method: "paypal",
        description: "Security deposit payment via PayPal",
        created_at: "2024-04-12T16:30:42Z",
        properties: { name: "Lakeside Villas #512" },
      };
    case 11: // Bank Transfer payment - completed
      return {
        ...basePayment,
        amount: 1300.0,
        status: "completed",
        payment_method: "bank_transfer",
        description: "Monthly rent payment via bank wire transfer",
        created_at: "2024-03-02T11:45:30Z",
        properties: { name: "Sunset Gardens #105" },
      };
    case 12: // Check payment - completed
      return {
        ...basePayment,
        amount: 950.0,
        status: "completed",
        payment_method: "check",
        description: "Monthly rent payment by check",
        created_at: "2024-03-05T14:20:00Z",
        properties: { name: "Oakwood Residences #307" },
      };
    case 13: // Check payment - failed (bounced)
      return {
        ...basePayment,
        amount: 1275.0,
        status: "failed",
        payment_method: "check",
        description: "Failed rent payment - check returned",
        created_at: "2024-02-05T09:10:00Z",
        properties: { name: "Mountain View Apartments #423" },
      };
    default:
      return basePayment;
  }
};

export function PaymentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // For now, we're using mock data
    // In a real application, you'd fetch the payment using the ID from the API
    const fetchPayment = async () => {
      try {
        // Get mock payment data based on the ID
        const mockPayment = getMockPayment(id || "1");
        setPayment(mockPayment);
      } catch (error) {
        console.error("Error fetching payment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id]);

  // Get status icon and variant
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">
          {t("payments.details.notFound")}
        </p>
        <Button
          onClick={() => navigate("/dashboard/payments")}
          className="mt-4"
        >
          {t("payments.details.backToPayments")}
        </Button>
      </div>
    );
  }

  const status = statuses.find((s) => s.value === payment.status);
  const invoiceNumber = `INV-${new Date(
    payment.created_at
  ).getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(
    5,
    "0"
  )}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/payments")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {t("payments.details.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("payments.details.transactionId")}: {payment.id}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t("payments.details.downloadReceipt")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Summary Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("payments.details.summary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {t("payment.amount")}
                  </span>
                </div>
                <span className="text-lg font-bold">
                  {formatCurrency(payment.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  <span className="text-sm font-medium">
                    {t("payment.status")}
                  </span>
                </div>
                <Badge variant={getStatusVariant(payment.status)}>
                  {status?.label || payment.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(payment.payment_method)}
                  <span className="text-sm font-medium">
                    {t("payment.method")}
                  </span>
                </div>
                <span className="text-sm">
                  {payment.payment_method.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">
                    {t("payment.date")}
                  </span>
                </div>
                <span className="text-sm">
                  {formatDate(payment.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">
                    {t("property.title")}
                  </span>
                </div>
                <span className="text-sm">
                  {payment.properties?.name || "Unknown Property"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 flex items-center justify-center text-gray-500 font-medium">
                    #
                  </span>
                  <span className="text-sm font-medium">
                    {t("payments.details.invoiceNumber")}
                  </span>
                </div>
                <span className="text-sm font-mono">{invoiceNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Description Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("payment.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {payment.description || t("payments.details.noDescription")}
            </p>

            {/* Payment Details Section - based on payment method */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium mb-3">
                {t("payments.details.paymentDetails")}
              </h3>

              {payment.payment_method === "credit_card" && (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{t("payments.details.creditCard.cardType")}: Visa</p>
                  <p>
                    {t("payments.details.creditCard.lastFour")}: **** **** ****{" "}
                    {Math.floor(1000 + Math.random() * 9000)}
                  </p>
                  <p>
                    {t("payments.details.creditCard.expiryDate")}:{" "}
                    {Math.floor(1 + Math.random() * 12)}/
                    {2024 + Math.floor(Math.random() * 5)}
                  </p>
                </div>
              )}

              {payment.payment_method === "ach" && (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    {t("payments.details.ach.bankName")}:{" "}
                    {
                      ["Chase", "Bank of America", "Wells Fargo", "Citibank"][
                        Math.floor(Math.random() * 4)
                      ]
                    }
                  </p>
                  <p>
                    {t("payments.details.ach.accountLastFour")}: ****{" "}
                    {Math.floor(1000 + Math.random() * 9000)}
                  </p>
                  <p>
                    {t("payments.details.ach.transferId")}: ACH-
                    {Math.floor(100000 + Math.random() * 900000)}
                  </p>
                </div>
              )}

              {payment.payment_method === "cash" && (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>{t("payments.details.cash.receivedBy")}: Office Staff</p>
                  <p>{t("payments.details.cash.location")}: Main Office</p>
                  <p>
                    {t("payments.details.cash.receiptNumber")}: RCPT-
                    {Math.floor(10000 + Math.random() * 90000)}
                  </p>
                </div>
              )}

              {payment.payment_method === "paypal" && (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    {t("payments.details.paypal.email", {
                      defaultValue: "PayPal Email",
                    })}
                    : user@example.com
                  </p>
                  <p>
                    {t("payments.details.paypal.transactionId", {
                      defaultValue: "Transaction ID",
                    })}
                    : PP-{Math.floor(100000 + Math.random() * 900000)}
                  </p>
                  <p>
                    {t("payments.details.paypal.paymentSource", {
                      defaultValue: "Payment Source",
                    })}
                    : {Math.random() > 0.5 ? "PayPal Balance" : "Credit Card"}
                  </p>
                </div>
              )}

              {payment.payment_method === "bank_transfer" && (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    {t("payments.details.bankTransfer.bankName", {
                      defaultValue: "Bank Name",
                    })}
                    :{" "}
                    {
                      ["Citibank", "HSBC", "TD Bank", "PNC Bank"][
                        Math.floor(Math.random() * 4)
                      ]
                    }
                  </p>
                  <p>
                    {t("payments.details.bankTransfer.referenceNumber", {
                      defaultValue: "Reference Number",
                    })}
                    : WIRE-{Math.floor(10000 + Math.random() * 90000)}
                  </p>
                  <p>
                    {t("payments.details.bankTransfer.senderName", {
                      defaultValue: "Sender Name",
                    })}
                    : {payment.status === "failed" ? "N/A" : "John Doe"}
                  </p>
                </div>
              )}

              {payment.payment_method === "check" && (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    {t("payments.details.check.checkNumber", {
                      defaultValue: "Check Number",
                    })}
                    : #{Math.floor(1000 + Math.random() * 9000)}
                  </p>
                  <p>
                    {t("payments.details.check.bankName", {
                      defaultValue: "Bank Name",
                    })}
                    :{" "}
                    {
                      ["Bank of America", "US Bank", "Chase", "Wells Fargo"][
                        Math.floor(Math.random() * 4)
                      ]
                    }
                  </p>
                  <p>
                    {t("payments.details.check.depositDate", {
                      defaultValue: "Deposit Date",
                    })}
                    : {new Date(payment.created_at).toLocaleDateString()}
                  </p>
                  {payment.status === "failed" && (
                    <p className="text-red-500">
                      {t("payments.details.check.returnReason", {
                        defaultValue: "Return Reason",
                      })}
                      : Insufficient Funds
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
