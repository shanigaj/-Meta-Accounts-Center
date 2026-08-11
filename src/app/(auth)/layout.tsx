import { FiShield } from "react-icons/fi";
import { ThemeToggle } from "@/components/theme";

// Split layout: a branded panel on the left, the form on the right.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <FiShield /> Accounts Center
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            One place to manage your identity.
          </h2>
          <p className="max-w-sm text-white/80">
            Control your profile, connected apps, security settings and privacy
            preferences — all from a single, secure dashboard.
          </p>
        </div>
        <p className="text-sm text-white/60">
          Built as a Meta Accounts Center demo.
        </p>
        {/* soft decorative glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
      </aside>

      <main className="relative flex items-center justify-center p-6">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
