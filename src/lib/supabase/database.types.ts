export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      carriers: {
        Row: {
          id: string;
          mc_number: string;
          usdot_status: string | null;
          usdot_number: string | null;
          mcs150_form_date: string | null;
          operating_authority_status: string | null;
          legal_name: string | null;
          dba_name: string | null;
          phone: string | null;
          power_units: number | null;
          drivers: number | null;
          import_status: "imported" | "not_found" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mc_number: string;
          usdot_status?: string | null;
          usdot_number?: string | null;
          mcs150_form_date?: string | null;
          operating_authority_status?: string | null;
          legal_name?: string | null;
          dba_name?: string | null;
          phone?: string | null;
          power_units?: number | null;
          drivers?: number | null;
          import_status?: "imported" | "not_found" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mc_number?: string;
          usdot_status?: string | null;
          usdot_number?: string | null;
          mcs150_form_date?: string | null;
          operating_authority_status?: string | null;
          legal_name?: string | null;
          dba_name?: string | null;
          phone?: string | null;
          power_units?: number | null;
          drivers?: number | null;
          import_status?: "imported" | "not_found" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
