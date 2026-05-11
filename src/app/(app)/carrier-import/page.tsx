import { CarrierImportForm } from "@/components/carriers/carrier-import-form";

export default function CarrierImportPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-card-foreground">Carrier Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Import FMCSA SAFER carriers by MC number and persist results into Supabase.
        </p>
      </div>
      <CarrierImportForm />
    </section>
  );
}
