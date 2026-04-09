import Link from "next/link";
import { BRAND } from "@/lib/brand";

const footerLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
  { href: "/car-boot-tips", label: "Car Boot Tips" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-brown/10 bg-brand-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="font-heading text-2xl font-semibold text-brand-ink">
            {BRAND.name}
          </p>
          <p className="max-w-2xl text-sm leading-7 text-brand-brown/80">
            Built for buyers who want practical details and for organisers who want
            a cleaner, more trustworthy profile than the old ad-heavy directories.
          </p>
          <p className="text-sm text-brand-brown/70">
            No third-party ad clutter. No tracking-first UX. Just clearer listings.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-brand-brown/80 transition hover:text-brand-ink"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`mailto:${BRAND.supportEmail}`}
            className="text-sm text-brand-brown/80 transition hover:text-brand-ink"
          >
            {BRAND.supportEmail}
          </a>
        </div>
      </div>
      <div className="border-t border-brand-brown/10 px-4 py-4 text-center text-xs uppercase tracking-[0.2em] text-brand-brown/60">
        © {new Date().getFullYear()} {BRAND.name}. Clean UK car boot sale discovery.
      </div>
    </footer>
  );
}
