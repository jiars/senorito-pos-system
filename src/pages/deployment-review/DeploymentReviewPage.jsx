import { Cloud, Database, HardDrive, Server, Tablet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const architecture = [
  {
    title: "Cafe Tablet",
    description: "Installed React PWA",
    icon: Tablet,
  },
  {
    title: "Cloudflare Pages",
    description: "Hosts HTML, CSS, JavaScript, and PWA files",
    icon: Cloud,
  },
  {
    title: "Render Singapore",
    description: "Runs the Laravel API",
    icon: Server,
  },
  {
    title: "Supabase",
    description: "PostgreSQL, image storage, and Cron",
    icon: Database,
  },
  {
    title: "Dexie",
    description: "Offline menu, stock, and pending orders",
    icon: HardDrive,
  },
];

const deploymentSteps = [
  "Check security blockers and environment variables",
  "Create the Laravel production Docker container",
  "Deploy and test Laravel on Render",
  "Deploy the React PWA to Cloudflare Pages",
  "Configure scheduled maintenance",
  "Test offline checkout and synchronization",
  "Configure backups and complete production QA",
];

const decisions = [
  {
    title: "Frontend",
    value: "Cloudflare Pages",
    note: "Best zero-cost host for the static React PWA files.",
  },
  {
    title: "Backend",
    value: "Render Free Singapore",
    note: "Accepted for the pilot, with expected cold starts.",
  },
  {
    title: "Data",
    value: "Supabase",
    note: "Keeps PostgreSQL, menu images, and scheduled maintenance.",
  },
];

const DeploymentReviewPage = () => {
  return (
    <main className="min-h-screen bg-[var(--app-color-canvas)] p-5 text-[var(--app-color-text)] md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="space-y-3">
          <Badge variant="outline">Temporary development page</Badge>

          <div>
            <h1 className="text-2xl font-semibold">
              Señorito POS Deployment Plan
            </h1>

            <p className="mt-1 text-sm text-[var(--app-color-text-muted)]">
              Zero-cost pilot architecture for one private cafe branch.
            </p>
          </div>
        </header>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">System Architecture</h2>
            <p className="text-sm text-[var(--app-color-text-muted)]">
              The path followed by the application and its data.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {architecture.map((item, index) => {
              const Icon = item.icon;

              return (
                <Card key={item.title}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className="size-5 text-[var(--app-color-brand)]" />
                      <span className="text-xs text-[var(--app-color-text-subtle)]">
                        {index + 1}
                      </span>
                    </div>

                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-[var(--app-color-text-muted)]">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {decisions.map((decision) => (
            <Card key={decision.title}>
              <CardHeader>
                <CardDescription>{decision.title}</CardDescription>
                <CardTitle>{decision.value}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-[var(--app-color-text-muted)]">
                  {decision.note}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Order</CardTitle>
              <CardDescription>
                We will finish these tasks in this order.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ol className="space-y-3">
                {deploymentSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--app-color-brand)] text-xs font-semibold text-white">
                      {index + 1}
                    </span>

                    <span className="pt-1 text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Rules</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <p>Do not expose the Supabase service-role key.</p>
              <p>Do not send fake requests to keep Render awake.</p>
              <p>Keep pending offline orders until Laravel confirms success.</p>
              <p>Create and test a database backup before pilot use.</p>
              <p>Remove this temporary page before the production build.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default DeploymentReviewPage;
