import { Property, PropertyFormValues } from "@/pages/Properties/types";
import { supabase } from "../lib/supabase";
import { handleServiceError } from "./utilityService";
import { Tenant } from "@/pages/Properties/types";
import { PostgrestError } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

// Define type for database insert/update operations
type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

export async function fetchTenants(): Promise<Tenant[]> {
  try {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("status", "active")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleServiceError(error, "fetchTenants");
  }
}

export const fetchProperties = async (): Promise<Property[]> => {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Map the published field to status
    return data.map((property) => ({
      ...property,
      status: property.published ? "published" : "draft",
    }));
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

export async function saveProperty(
  userId: string, 
  propertyData: PropertyFormValues, 
  propertyId?: string,
  workspaceId?: string
): Promise<string | null> {
  try {
    // Extract tenant_id from property data to handle separately
    const { tenant_id, syndication, ...propertyFields } = propertyData;
    
    // Create a data object with properly serialized syndication
    const dataToSave = {
      ...propertyFields,
      // Convert syndication object to JSON format for database - handle null case
      syndication: syndication ? JSON.stringify(syndication) : null,
    };
    
    if (propertyId) { 
      // Update existing property using the proper database type
      const { error } = await supabase
        .from("properties")
        .update({
          ...dataToSave,
          updated_at: new Date().toISOString(),
        } as PropertyUpdate) // Type assertion using the database Update type
        .eq("id", propertyId);

      if (error) throw error;
      
      // If tenant_id was specified, update the property_leases table
      if (tenant_id) {
        // First check if there's an existing lease for this property
        const { data: existingLeases } = await supabase
          .from("property_leases")
          .select("id")
          .eq("property_id", propertyId);
          
        if (existingLeases && existingLeases.length > 0) {
          // Update existing lease
          const { error: leaseError } = await supabase
            .from("property_leases")
            .update({
              tenant_id: tenant_id,
              status: "active",
              updated_at: new Date().toISOString()
            })
            .eq("property_id", propertyId);
            
          if (leaseError) throw leaseError;
        } else {
          // Create new lease
          const { error: leaseError } = await supabase
            .from("property_leases")
            .insert([{
              property_id: propertyId,
              tenant_id: tenant_id,
              status: "active"
            }]);
            
          if (leaseError) throw leaseError;
        }
      }
      
      return propertyId;
    } else {
      // Create new property
      if (!workspaceId) {
        // Try to get user's default workspace
        const { data: workspaceData, error: workspaceError } = await supabase
          .rpc('get_default_workspace', { p_user_id: userId });
        
        if (workspaceError || !workspaceData) {
          throw new Error("Workspace ID is required when creating a new property");
        }
        
        workspaceId = workspaceData;
      }
      
      // Insert the property with processed data using the proper database type
      const { data: newProperty, error } = await supabase
        .from("properties")
        .insert({
          ...dataToSave,
          user_id: userId,
          workspace_id: workspaceId,
          compliance_status: "pending",
        } as PropertyInsert) // Type assertion using the database Insert type
        .select();

      if (error) throw error;
      
      if (newProperty && newProperty.length > 0) {
        const newPropertyId = newProperty[0].id;
        
        // If tenant_id is specified and property was created successfully, create a lease
        if (tenant_id) {
          const { error: leaseError } = await supabase
            .from("property_leases")
            .insert([{
              property_id: newPropertyId,
              tenant_id: tenant_id,
              status: "active"
            }]);
            
          if (leaseError) throw leaseError;
        }
        
        return newPropertyId;
      }
      
      return null;
    }
  } catch (error) {
    const err = error as PostgrestError | Error;
    handleServiceError(err, "saveProperty");
    return null;
  }
}

export async function deleteProperty(propertyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (error) throw error;
  } catch (error) {
    return handleServiceError(error, "deleteProperty");
  }
}

export async function togglePropertyPublishStatus(property: Property): Promise<void> {
  try {
    const { error } = await supabase
      .from("properties")
      .update({
        published: !property.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", property.id);

    if (error) throw error;
  } catch (error) {
    return handleServiceError(error, "togglePropertyPublishStatus");
  }
}

export async function fetchPropertyById(propertyId: string): Promise<Property | null> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        property_leases (
          tenant:tenant_id (
            id,
            name
          )
        )
      `
      )
      .eq("id", propertyId)
      .single();

    if (error) throw error;
    
    // Add the status field to match Property interface
    return data ? {
      ...data,
      status: data.published ? "published" : "draft"
    } : null;
  } catch (error) {
    console.error("Error fetching property details:", error);
    return null;
  }
}
