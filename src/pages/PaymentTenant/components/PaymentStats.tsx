import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PaymentStatsProps = {
  totalPaid: number;
  pending: number;
  failed: number;
};

const cardContentClass = "mt-[-12px]";

export function PaymentStats({
  totalPaid,
  pending,
  failed,
}: PaymentStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className={cardContentClass}>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              ${totalPaid.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Total completed payments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className={cardContentClass}>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              ${pending.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Awaiting payment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className={cardContentClass}>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">${failed.toLocaleString()}</div>
          </div>
          <p className="text-xs text-muted-foreground">Failed transactions</p>
        </CardContent>
      </Card>
    </div>
  );
}
