import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function wrapPromise<T>(promise: Promise<T>) {
  let status: 'pending' | 'success' | 'error' = "pending";
  let result: T;
  let error: Error;

  const suspender = promise.then(
    (r) => {
      status = "success";
      result = r;
    },
    (e) => {
      status = "error";
      error = e;
    }
  );

  return {
    read(): T {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw error;
      } else {
        return result;
      }
    },
  };
}

export function formatPrice(price: number | string | undefined): string {
  if (price === undefined) return "$0";
  
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
}