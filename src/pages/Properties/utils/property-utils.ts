import { Property } from "../types";

/**
 * Format a property address for display
 */
export function formatPropertyAddress(property: Property): string {
  const { address, city, state, zip_code } = property;
  const parts = [address];
  
  if (city || state) {
    parts.push(`${city || ''}, ${state || ''} ${zip_code || ''}`);
  }
  
  return parts.filter(Boolean).join(', ');
}

/**
 * Check if a property is valid for publishing
 * Returns an array of validation errors or an empty array if valid
 */
export function validatePropertyForPublishing(property: Property): string[] {
  const errors: string[] = [];
  
  if (!property.name?.trim()) {
    errors.push("Property name is required");
  }
  
  if (!property.address?.trim()) {
    errors.push("Address is required");
  }
  
  if (!property.city?.trim()) {
    errors.push("City is required");
  }
  
  if (!property.state?.trim()) {
    errors.push("State is required");
  }
  
  if (!property.zip_code?.trim()) {
    errors.push("ZIP code is required");
  }
  
  if (!property.price || property.price <= 0) {
    errors.push("A valid price is required");
  }
  
  if (!property.property_type) {
    errors.push("Property type is required");
  }
  
  return errors;
}

/**
 * Parse the square footage value based on measurement system
 */
export function parseSquareFootage(property: Property): string {
  if (property.measurement_system === 'metric' && property.square_meters) {
    return `${property.square_meters.toLocaleString()} m²`;
  } else if (property.square_feet) {
    return `${property.square_feet.toLocaleString()} sq.ft`;
  }
  return 'Not specified';
}

/**
 * Format the price for display
 */
export function formatPropertyPrice(price?: number | null): string {
  if (!price && price !== 0) return 'Not specified';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Calculate property status text and color
 */
export function getPropertyStatusDetails(property: Property): { 
  label: string; 
  color: 'default' | 'secondary' | 'destructive' | 'outline'; 
} {
  if (property.status === 'published') {
    return { label: 'Published', color: 'default' };
  }
  return { label: 'Draft', color: 'outline' };
}

/**
 * Format date for display
 */
export function formatDate(date?: string | null): string {
  if (!date) return 'Not specified';
  return new Date(date).toLocaleDateString();
}

/**
 * Generate a descriptive property summary
 */
export function generatePropertySummary(property: Property): string {
  const { bedrooms, bathrooms, property_type } = property;
  const parts = [];
  
  if (property_type) {
    parts.push(property_type.charAt(0).toUpperCase() + property_type.slice(1));
  }
  
  if (bedrooms || bathrooms) {
    const beds = bedrooms ? `${bedrooms} bed${bedrooms !== 1 ? 's' : ''}` : '';
    const baths = bathrooms ? `${bathrooms} bath${bathrooms !== 1 ? 's' : ''}` : '';
    parts.push([beds, baths].filter(Boolean).join(', '));
  }
  
  return parts.join(' • ');
} 