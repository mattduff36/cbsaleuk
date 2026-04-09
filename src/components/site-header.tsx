"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BRAND, NAV_ITEMS } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

const organiserLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/list-sale", label: "List a sale" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  const userLinks = useMemo(() => {
    if (!isAuthenticated || !user) {
      return [];
    }

    return user.role === "admin"
      ? [...organiserLinks, { href: "/admin", label: "Admin" }]
      : organiserLinks;
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
            <Image
              src="/brand/logo.png"
              alt={BRAND.name}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden min-w-0 sm:block">
            <div className="truncate text-base font-semibold text-white">
              {BRAND.name}
            </div>
            <div className="truncate text-[10px] uppercase tracking-[0.22em] text-brand-green/80">
              Trusted UK car boot listings
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium text-white/75 transition hover:bg-white/10 hover:text-white",
                pathname === item.href && "bg-white/10 text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
          {userLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium text-white/75 transition hover:bg-white/10 hover:text-white",
                pathname === item.href && "bg-white/10 text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated && user ? (
            <>
              <Button
                variant="ghost"
                className="whitespace-nowrap rounded-full border border-white/10 px-4 text-white hover:bg-white/10 hover:text-white"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="whitespace-nowrap rounded-full border border-white/10 px-4 text-white hover:bg-white/10 hover:text-white"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="whitespace-nowrap rounded-full bg-brand-green px-4 text-brand-ink hover:bg-brand-green/90">
                  Start listing
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex rounded-full border border-white/10 p-2 text-white lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-brand-ink lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
            {[...NAV_ITEMS, ...userLinks].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white",
                  pathname === item.href && "bg-white/10 text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
            {!isLoading && isAuthenticated && user ? (
              <>
                <Button
                  variant="ghost"
                  className="justify-start rounded-2xl border border-white/10 px-4 py-3 text-white hover:bg-white/10 hover:text-white"
                  onClick={async () => {
                    setMenuOpen(false);
                    await handleLogout();
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-2xl border border-white/10 px-4 py-3 text-white hover:bg-white/10 hover:text-white"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full justify-start rounded-2xl bg-brand-green px-4 py-3 text-brand-ink hover:bg-brand-green/90">
                    Start listing
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
