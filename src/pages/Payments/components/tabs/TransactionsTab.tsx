import React from "react";
import { ChevronDown, Download, Filter } from "lucide-react";
import { FilterPanel } from "../FilterPanel";
import { Payment, PaymentFilters } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePayment";
import {
  formatCurrency,
  formatDate,
  formatPaymentMethod,
  getStatusBadgeVariant,
  getPaymentMethodIcon,
} from "../../utils";

interface TransactionsTabProps {
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filters: PaymentFilters;
  setFilters: React.Dispatch<React.SetStateAction<PaymentFilters>>;
  resetFilters: () => void;
  exportPayments: () => void;
  filteredPayments: Payment[];
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  isFilterModalOpen,
  setIsFilterModalOpen,
  filters,
  setFilters,
  resetFilters,
  exportPayments,
  filteredPayments,
}) => {
  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    prevPage,
    nextPage,
  } = usePagination(filteredPayments);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
            className="flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {Object.values(filters).some((value) => value !== "") && (
              <Badge variant="secondary" className="ml-2">
                {Object.values(filters).filter((value) => value !== "").length}
              </Badge>
            )}
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform ${
                isFilterModalOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
          <Button variant="outline" onClick={exportPayments}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isFilterModalOpen && (
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {currentItems.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              currentItems.map((payment) => (
                <div
                  key={payment.id}
                  className="group flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {payment.properties?.name}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        - {formatPaymentMethod(payment.payment_method)}
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm">
                      {getPaymentMethodIcon(payment.payment_method)}
                      <span className="ml-2">
                        {payment.description || "No description"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4">
                      <span className="tabular-nums text-sm font-medium">
                        {formatCurrency(payment.amount)}
                      </span>
                      <Badge
                        variant={getStatusBadgeVariant(payment.status)}
                        className="capitalize"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(payment.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {currentItems.length > 0 && (
        <div className="flex justify-center">
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
      )}
    </div>
  );
};
