const metricCards = [
  { label: "Active Loads", value: "24" },
  { label: "Available Drivers", value: "17" },
  { label: "Pending Invoices", value: "9" },
  { label: "On-time Delivery", value: "96%" },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-card-foreground">Dispatch Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Foundation dashboard shell for upcoming trucking dispatch CRM modules.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <article key={metric.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-card-foreground">{metric.value}</p>
          </article>
        ))}
      </div>
      <article className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold text-card-foreground">Module placeholders</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No business modules are implemented yet. This workspace is prepared for loads, drivers,
          tracking, invoicing, and communication features.
        </p>
      </article>
    </section>
  );
}
