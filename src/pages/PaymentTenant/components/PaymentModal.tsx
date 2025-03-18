import { Building2, CreditCard, DollarSign, X } from "lucide-react";
import { Payment } from "../types";

type PaymentModalProps = {
  payment: Payment;
  onClose: () => void;
  onProcessPayment: (method: "credit_card" | "ach" | "cash") => void;
};

export function PaymentModal({
  payment,
  onClose,
  onProcessPayment,
}: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Process Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Amount:</span> $
              {payment?.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Property:</span>{" "}
              {payment?.properties.name}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Invoice:</span>{" "}
              {payment?.invoice_number}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onProcessPayment("credit_card")}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay with Credit Card
            </button>

            <button
              onClick={() => onProcessPayment("ach")}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Pay with ACH Transfer
            </button>

            <button
              onClick={() => onProcessPayment("cash")}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Pay with Cash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
