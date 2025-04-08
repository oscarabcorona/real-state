import { Property, PropertyFormValues } from "@/pages/Properties/types";
import { supabase } from "../lib/supabase";
import { handleServiceError } from "./utilityService";
import { Tenant } from "@/pages/Properties/types";

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
): Promise<void> {
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
      // Update existing property
      const { error } = await supabase
        .from("properties")
        .update({
          ...dataToSave,
          updated_at: new Date().toISOString(),
        })
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
      
      // Insert the property with processed data
      const { data: newProperty, error } = await supabase
        .from("properties")
        .insert([{
          ...dataToSave,
          user_id: userId,
          workspace_id: workspaceId,
          compliance_status: "pending",
        }])
        .select();

      if (error) throw error;
      
      // If tenant_id is specified and property was created successfully, create a lease
      if (tenant_id && newProperty && newProperty.length > 0) {
        const { error: leaseError } = await supabase
          .from("property_leases")
          .insert([{
            property_id: newProperty[0].id,
            tenant_id: tenant_id,
            status: "active"
          }]);
          
        if (leaseError) throw leaseError;
      }
    }
  } catch (error) {
    return handleServiceError(error, "saveProperty");
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
    return data;
  } catch (error) {
    console.error("Error fetching property details:", error);
    return null;
  }
}
