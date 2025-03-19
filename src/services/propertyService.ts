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

export async function fetchProperties(userId: string, selectedTenant: string = ""): Promise<Property[]> {
  try {
    let query = supabase
      .from("properties")
      .select(
        `
        *,
        property_leases (
          tenant:tenant_id (
            name
          )
        )
      `
      )
      .eq("user_id", userId);

    if (selectedTenant && selectedTenant !== "all") {
      query = query.eq("property_leases.tenant_id", selectedTenant);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleServiceError(error, "fetchProperties");
  }
}

export async function saveProperty(
  userId: string, 
  propertyData: PropertyFormValues, 
  propertyId?: string
): Promise<void> {
  try {
    
    if (propertyId) { 
      const { error } = await supabase
        .from("properties")
        .update({
          ...propertyData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", propertyId);

      if (error) throw error;
    } else {
      // Create new property
      const { error } = await supabase
        .from("properties")
        .insert([
          {
            ...propertyData,
            user_id: userId,
            compliance_status: "pending",
          },
        ]);

      if (error) throw error;
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
