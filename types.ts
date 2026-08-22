export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: { id: string; company_code: string; legal_name: string; display_name: string; status: "ACTIVE" | "INACTIVE" | "ARCHIVED"; city: string | null; state: string | null; email: string | null; phone: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; company_code: string; legal_name: string; display_name: string; status?: "ACTIVE" | "INACTIVE" | "ARCHIVED"; city?: string | null; state?: string | null; email?: string | null; phone?: string | null };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      business_partners: {
        Row: { id: string; company_id: string; partner_code: string; partner_type: "CLIENT" | "VENDOR" | "BOTH"; company_name: string; contact_person: string | null; email: string | null; phone: string | null; payment_terms_days: number; status: "ACTIVE" | "INACTIVE" | "ARCHIVED"; created_at: string; updated_at: string };
        Insert: { id?: string; company_id: string; partner_code: string; partner_type: "CLIENT" | "VENDOR" | "BOTH"; company_name: string; contact_person?: string | null; email?: string | null; phone?: string | null; payment_terms_days?: number; status?: "ACTIVE" | "INACTIVE" | "ARCHIVED" };
        Update: Partial<Database["public"]["Tables"]["business_partners"]["Insert"]>;
      };
      service_orders: {
        Row: { id: string; company_id: string; business_partner_id: string; order_number: string; service_description: string; start_date: string; end_date: string | null; contract_value: number; billing_frequency: "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONE_TIME" | "CUSTOM"; billing_day: number | null; payment_terms_days: number; status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED" | "CANCELLED"; notes: string | null; created_by: string; created_at: string; updated_at: string };
        Insert: { id?: string; company_id: string; business_partner_id: string; order_number: string; service_description: string; start_date: string; end_date?: string | null; contract_value?: number; billing_frequency: "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONE_TIME" | "CUSTOM"; billing_day?: number | null; payment_terms_days?: number; status?: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED" | "CANCELLED"; notes?: string | null; created_by: string };
        Update: Partial<Database["public"]["Tables"]["service_orders"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      client_invoice_summary: {
        Args: { p_invoice_id: string };
        Returns: Array<{ invoice_id: string; invoice_number: string; invoice_date: string; billing_period: string; due_date: string; subtotal: number; gst_amount: number; total_amount: number; currency: string; status: "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED" | "ARCHIVED"; paid_amount: number; outstanding_amount: number }>;
      };
      client_document_metadata: {
        Args: { p_document_id: string };
        Returns: Array<{ document_id: string; document_type: "SERVICE_ORDER" | "INVOICE" | "PAYMENT_PROOF" | "RECEIPT" | "CONTRACT" | "STATEMENT" | "OTHER"; file_name: string; mime_type: string; file_size: number; uploaded_at: string; can_download: boolean }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TableName = keyof Database["public"]["Tables"];
export type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
