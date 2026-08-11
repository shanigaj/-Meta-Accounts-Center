"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FiBookOpen, FiLock, FiLogOut, FiMenu, FiShield, FiX } from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/theme";
import { cn } from "@/lib/cn";
import { api } from "@/lib/http";
import { NAV } from "@/lib/nav";
import { useMe } from "@/hooks";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMe();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Even if the call fails, send the user to the login screen.
    }
    router.replace("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand-soft text-brand"
                : "text-muted hover:bg-border/40 hover:text-text"
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}

      {/* Admin-only entry — RBAC surfaced in the UI. */}
      {user?.role === "ADMIN" && (
        <Link
          href="/admin"
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
            pathname.startsWith("/admin")
              ? "bg-brand-soft text-brand"
              : "text-muted hover:bg-border/40 hover:text-text"
          )}
        >
          <FiLock size={18} />
          Admin
        </Link>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-surface p-4 lg:flex">
        <div className="flex items-center gap-2 px-2 py-3 text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
            <FiShield size={17} />
          </span>
          Accounts Center
        </div>
        <div className="mt-4 flex-1">{nav}</div>
        <a
          href="/api-docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-border/40 hover:text-text"
        >
          <FiBookOpen size={18} /> API docs
        </a>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-danger/10 hover:text-danger"
        >
          <FiLogOut size={18} /> Sign out
        </button>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between px-2 py-2">
              <span className="flex items-center gap-2 font-semibold">
                <FiShield className="text-brand" /> Accounts Center
              </span>
              <button onClick={() => setOpen(false)} className="text-muted">
                <FiX size={20} />
              </button>
            </div>
            <div className="mt-4 flex-1">{nav}</div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur lg:px-8">
          <button
            className="rounded-lg p-2 text-muted hover:bg-border/40 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2.5">
                <Avatar name={user.name} src={user.avatarUrl} size={34} />
                <div className="hidden text-sm leading-tight sm:block">
                  <p className="font-medium text-text">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
