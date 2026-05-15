import { UsdotNumbersDashboard } from "@/components/carriers/usdot-numbers-dashboard";

export default function UsdotNumbersPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-card-foreground">USDOT Numbers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review searched MC numbers and their related USDOT numbers.
        </p>
      </div>
      <UsdotNumbersDashboard />
    </section>
  );
}
