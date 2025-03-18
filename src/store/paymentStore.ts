import { create } from 'zustand';
import { Payment, PaymentFilters, Property } from '@/pages/Payments/types';
import {
  calculatePaymentStats,
  createPayment,
  fetchUserPayments,
  fetchUserProperties,
  filterPayments,
} from '@/services/paymentService';
import { SetStateAction } from 'react';
 
interface PaymentState {
  payments: Payment[];
  filteredPayments: Payment[];
  properties: Property[];
  loading: boolean;
  error: Error | null;
  filters: PaymentFilters;
  stats: {
    totalCollected: number;
    pending: number;
    propertiesCount: number;
    autoPayActive: number;
  };

  // Actions
  fetchData: (userId: string) => Promise<void>;
  setFilters: (filtersOrUpdater: SetStateAction<PaymentFilters>) => void;
  resetFilters: () => void;
  createNewPayment: (userId: string, paymentData: {
    property_id: string;
    amount: string;
    payment_method: "credit_card" | "ach" | "cash";
    description: string;
  }) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  filteredPayments: [],
  properties: [],
  loading: false,
  error: null,
  filters: {
    status: "",
    paymentMethod: "",
    dateRange: "",
    minAmount: "",
    maxAmount: "",
  },
  stats: {
    totalCollected: 0,
    pending: 0,
    propertiesCount: 0,
    autoPayActive: 0,
  },

  // Actions
  fetchData: async (userId: string) => {
    if (!userId) return;

    set({ loading: true, error: null });

    try {
      const [propsData, paymentsData] = await Promise.all([
        fetchUserProperties(userId),
        fetchUserPayments(userId),
      ]);

      const stats = calculatePaymentStats(paymentsData, propsData.length);

      set({
        properties: propsData,
        payments: paymentsData,
        filteredPayments: paymentsData,
        stats,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching payment data:', error);
      set({ error: error as Error, loading: false });
    }
  },

  setFilters: (filtersOrUpdater: SetStateAction<PaymentFilters>) => {
    const { payments, filters: currentFilters } = get();
    
    // Handle both direct values and updater functions
    const newFilters = typeof filtersOrUpdater === 'function' 
      ? filtersOrUpdater(currentFilters)
      : filtersOrUpdater;
      
    const filtered = filterPayments(payments, newFilters);
    set({ filters: newFilters, filteredPayments: filtered });
  },

  resetFilters: () => {
    const { payments } = get();
    set({
      filters: {
        status: "",
        paymentMethod: "",
        dateRange: "",
        minAmount: "",
        maxAmount: "",
      },
      filteredPayments: payments,
    });
  },

  createNewPayment: async (userId: string, paymentData) => {
    if (!userId) return;

    set({ loading: true, error: null });

    try {
      await createPayment(userId, paymentData);
      await get().fetchData(userId);
    } catch (error) {
      console.error('Error creating payment:', error);
      set({ error: error as Error, loading: false });
    }
  },
}));
