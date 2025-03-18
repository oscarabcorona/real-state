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
import { usePagination } from "@/hooks/usePayment";
import { formatCurrency, formatDate } from "../../utils";

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
  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    prevPage,
    nextPage,
  } = usePagination(filteredPayments, 5);

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
                {formatCurrency(stats.totalCollected)}
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
                {formatCurrency(stats.pending)}
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
                            {formatDate(payment.created_at)}
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
                          {formatCurrency(payment.amount)}
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
                            prevPage();
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
                              goToPage(i + 1);
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
                            nextPage();
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
