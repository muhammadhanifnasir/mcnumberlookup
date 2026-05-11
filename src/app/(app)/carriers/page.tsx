import { CarriersDashboard } from "@/components/carriers/carriers-dashboard";

export default function CarriersPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-card-foreground">Carriers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review imported carrier records and their latest extraction status.
        </p>
      </div>
      <CarriersDashboard />
    </section>
  );
}
