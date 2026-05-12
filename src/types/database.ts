export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      carriers: {
        Row: {
          created_at: string;
          dba_name: string | null;
          drivers: number | null;
          id: string;
          import_status: "failed" | "imported" | "not_found";
          legal_name: string | null;
          mc_number: string;
          mcs150_form_date: string | null;
          operating_authority_status: string | null;
          phone: string | null;
          power_units: number | null;
          updated_at: string;
          usdot_number: string | null;
          usdot_status: string | null;
        };
        Insert: {
          created_at?: string;
          dba_name?: string | null;
          drivers?: number | null;
          id?: string;
          import_status?: "failed" | "imported" | "not_found";
          legal_name?: string | null;
          mc_number: string;
          mcs150_form_date?: string | null;
          operating_authority_status?: string | null;
          phone?: string | null;
          power_units?: number | null;
          updated_at?: string;
          usdot_number?: string | null;
          usdot_status?: string | null;
        };
        Update: {
          created_at?: string;
          dba_name?: string | null;
          drivers?: number | null;
          id?: string;
          import_status?: "failed" | "imported" | "not_found";
          legal_name?: string | null;
          mc_number?: string;
          mcs150_form_date?: string | null;
          operating_authority_status?: string | null;
          phone?: string | null;
          power_units?: number | null;
          updated_at?: string;
          usdot_number?: string | null;
          usdot_status?: string | null;
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
