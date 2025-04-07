import { Check, Clock, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaymentStatsProps {
  totalPaid: number;
  pending: number;
  failed: number;
  totalPaidChange?: number;
  pendingChange?: number;
  failedChange?: number;
}

export function PaymentStats({
  totalPaid,
  pending,
  failed,
  totalPaidChange = 0,
  pendingChange = 0,
  failedChange = 0,
}: PaymentStatsProps) {
  const { t } = useTranslation();

  const formatPercentage = (value: number) => {
    const absValue = Math.abs(value);
    return `${value >= 0 ? "+" : "-"}${absValue}%`;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {t("paymentTenant.stats.totalPaid")}
          </div>
          <Check className="h-4 w-4 text-green-500" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-medium">
            $
            {totalPaid.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="mt-1 flex items-center gap-1">
            {totalPaidChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span
              className={
                totalPaidChange >= 0
                  ? "text-sm text-green-500"
                  : "text-sm text-destructive"
              }
            >
              {formatPercentage(totalPaidChange)}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("paymentTenant.stats.fromLastMonth")}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {t("paymentTenant.stats.totalCompletedPayments")}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {t("paymentTenant.stats.pending")}
          </div>
          <Clock className="h-4 w-4 text-yellow-500" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-medium">{pending}</div>
          <div className="mt-1 flex items-center gap-1">
            {pendingChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm text-yellow-500">
              {formatPercentage(pendingChange)}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("paymentTenant.stats.fromLastMonth")}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {t("paymentTenant.stats.awaitingPayment")}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {t("paymentTenant.stats.failed")}
          </div>
          <XCircle className="h-4 w-4 text-destructive" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-medium">{failed}</div>
          <div className="mt-1 flex items-center gap-1">
            {failedChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            <span
              className={
                failedChange >= 0
                  ? "text-sm text-destructive"
                  : "text-sm text-green-500"
              }
            >
              {formatPercentage(failedChange)}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("paymentTenant.stats.fromLastMonth")}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {t("paymentTenant.stats.failedTransactions")}
          </div>
        </div>
      </div>
    </div>
  );
}
