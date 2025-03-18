import React from "react";
import { Building2, CreditCard, DollarSign, Smartphone } from "lucide-react";
import { Payment } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface OverviewTabProps {
  stats: {
    totalCollected: number;
    pending: number;
    propertiesCount: number;
    autoPayActive: number;
  };
  filteredPayments: Payment[];
  getStatusIcon: (status: string) => React.ReactElement;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  filteredPayments,
  getStatusIcon,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const currentItems = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [currentPage, filteredPayments]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collected
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mt-[-12px]">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                ${stats.totalCollected.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mt-[-12px]">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                ${stats.pending.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Awaiting collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mt-[-12px]">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{stats.propertiesCount}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Total managed properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Auto-pay Enabled
            </CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mt-[-12px]">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{stats.autoPayActive}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Active subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="relative min-h-[300px]">
            {filteredPayments.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  No transactions found
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 pr-4">
                  {currentItems.map((payment) => (
                    <div
                      key={payment.id}
                      className="group flex items-center justify-between space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-muted-foreground transition-colors group-hover:text-foreground">
                          {getStatusIcon(payment.status)}
                        </div>
                        <div>
                          <p className="font-medium leading-none mb-2">
                            {payment.properties?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                        <span className="font-medium tabular-nums">
                          ${payment.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((p) => Math.max(1, p - 1));
                          }}
                          aria-disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i + 1);
                            }}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                          }}
                          aria-disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
