import React from "react";
import { X } from "lucide-react";
import { Property } from "../types";

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
  handleSubmit: (e: React.FormEvent) => Promise<void>;
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
}) => (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full">
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-lg font-medium">New Payment</h3>
        <button
          onClick={() => setIsModalOpen(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Property
          </label>
          <select
            value={formData.property_id}
            onChange={(e) =>
              setFormData({ ...formData, property_id: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select a property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <select
            value={formData.payment_method}
            onChange={(e) =>
              setFormData({
                ...formData,
                payment_method: e.target.value as
                  | "credit_card"
                  | "ach"
                  | "cash",
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="credit_card">Credit Card</option>
            <option value="ach">ACH Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            placeholder="Payment description"
          />
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              "Create Payment"
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);
