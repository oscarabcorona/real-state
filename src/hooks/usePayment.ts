import { useState, useCallback, useEffect } from 'react';
import { usePaymentStore } from '@/store/paymentStore';
import { exportPaymentsToCSV } from '@/services/paymentService';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
 

export function usePaymentData() {
  const { user } = useAuthStore();
  const { 
    fetchData, 
    payments, 
    filteredPayments, 
    properties, 
    stats, 
    loading,
    filters,
    setFilters,
    resetFilters
  } = usePaymentStore();

  useEffect(() => {
    if (user?.id) {
      fetchData(user.id);
    }
  }, [user, fetchData]);

  return {
    payments,
    filteredPayments,
    properties,
    stats,
    loading,
    filters,
    setFilters,
    resetFilters
  };
}

export function usePaymentModals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const togglePaymentModal = useCallback(() => {
    setIsModalOpen(prev => !prev);
  }, []);

  const toggleFilterModal = useCallback(() => {
    setIsFilterModalOpen(prev => !prev);
  }, []);

  return {
    isModalOpen,
    isFilterModalOpen,
    setIsModalOpen,
    setIsFilterModalOpen,
    togglePaymentModal,
    toggleFilterModal
  };
}

export function usePaymentForm() {
  const { user } = useAuthStore();
  const { createNewPayment, loading } = usePaymentStore();
  
  const [formData, setFormData] = useState({
    property_id: "",
    amount: "",
    payment_method: "credit_card" as "credit_card" | "ach" | "cash",
    description: "",
  });

  // Get properties based on user role (lessor or tenant)
  const { data: propertiesWithTenants } = useQuery({
    queryKey: ['propertiesWithTenants', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_properties_with_tenants', { p_user_id: user.id });
    
      if (error) {
        toast.error("Error fetching properties: " + error.message);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    await createNewPayment(user.id, formData);
    
    // Reset form
    setFormData({
      property_id: "",
      amount: "",
      payment_method: "credit_card",
      description: "",
    });
    
    return true; // Return success status for the component to close modal
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    loading,
    propertiesWithTenants: propertiesWithTenants || [],
  };
}

export function usePaymentExport() {
  const { filteredPayments } = usePaymentStore();
  
  const handleExportPayments = useCallback(() => {
    exportPaymentsToCSV(filteredPayments);
  }, [filteredPayments]);
  
  return { handleExportPayments };
}

export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const currentItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);
  
  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);
  
  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage
  };
}
