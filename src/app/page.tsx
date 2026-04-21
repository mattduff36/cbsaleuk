import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { BlogCard } from "@/components/blog-card";
import ListingCard from "@/components/listing-card";
import { LiveSearch } from "@/components/live-search";
import { Button } from "@/components/ui/button";
import { BRAND, TIER_FEATURES } from "@/lib/brand";
import { getBlogPosts, getFeaturedListings } from "@/lib/data";

export default async function Home() {
  const [featuredSales, blogPosts] = await Promise.all([
    getFeaturedListings(),
    getBlogPosts(),
  ]);

  return (
    <div className="noise-bg">
      <section className="relative overflow-hidden px-4 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="hero-panel relative overflow-hidden rounded-[2rem] px-5 py-8 text-white shadow-field sm:px-8 sm:py-10 lg:px-12 lg:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(127,255,0,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(135,206,235,0.22),transparent_28%)]" />
            <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
              <div className="mb-6">
                <div className="relative mt-4 inline-block">
                  <Image
                    src="/brand/wordmark.png"
                    alt={BRAND.name}
                    width={420}
                    height={84}
                    priority
                    className="h-auto w-[12rem] sm:w-[16rem]"
                  />
                  <div className="absolute bottom-[0.15rem] left-0 text-[7px] font-semibold uppercase tracking-[0.26em] text-brand-green sm:bottom-1 sm:left-1 sm:text-[7.5px]">
                    UK car boot listings
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/88 shadow-[0_20px_40px_rgba(0,0,0,0.2)] backdrop-blur-md sm:text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
                Clean, verified, ad-free discovery
              </div>
              <h1 className="font-heading mt-6 max-w-[11ch] text-[clamp(1.9rem,7.6vw,3rem)] font-semibold leading-[0.98] sm:max-w-[13ch] sm:text-[3.5rem] lg:text-[4.5rem]">
                Find the right UK car boot sale.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:mt-6 sm:text-lg">
                Search by place, distance, and weekend day. Check the practical details,
                spot verified organisers, and browse a cleaner marketplace than the old
                ad-heavy directories.
              </p>
              <div className="mt-6 w-full max-w-3xl rounded-[1.75rem] border border-white/15 bg-white/90 p-5 text-brand-ink shadow-field sm:mt-8">
                <LiveSearch />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                Featured this weekend
              </div>
              <h2 className="font-heading mt-2 text-4xl font-semibold text-brand-ink">
                Premium listings built to be trusted at a glance
              </h2>
            </div>
            <Link
              href="/search"
              className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-brand-ink sm:inline-flex sm:items-center sm:gap-2"
            >
              Browse every listing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredSales.map((sale) => (
              <ListingCard key={sale.id} sale={sale} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-card p-8">
            <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
              Organiser tiers
            </div>
            <h2 className="font-heading mt-3 text-4xl font-semibold text-brand-ink">
              Free essentials for launch, richer premium tools for serious organisers
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-brown/80">
              Premium is priced at £25 a year per listing and is designed around better
              trust signals, stronger storytelling, and a cleaner buyer experience.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-brand-brown/10 bg-brand-cream p-6">
                <div className="font-heading text-2xl text-brand-ink">Free</div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-brown/80">
                  {TIER_FEATURES.free.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-brand-green/30 bg-brand-green/10 p-6">
                <div className="font-heading text-2xl text-brand-ink">Premium</div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-brown/85">
                  {TIER_FEATURES.premium.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/subscribe">
                <Button className="rounded-full bg-brand-ink px-6 text-white hover:bg-brand-brown">
                  View premium plan
                </Button>
              </Link>
              <Link href="/list-sale">
                <Button
                  variant="outline"
                  className="rounded-full border-brand-brown/20 bg-white"
                >
                  Create organiser listing
                </Button>
              </Link>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="grid gap-0 md:grid-cols-2">
              <div className="relative min-h-[320px]">
                <Image
                  src="/assets/carboot2_1757961041589.png"
                  alt="Car boot sale branding artwork"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6 p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-brown/10 bg-brand-cream px-4 py-2 text-xs uppercase tracking-[0.18em] text-brand-brown/70">
                  <BadgeCheck className="h-4 w-4 text-brand-green" />
                  Verified organiser workflow
                </div>
                <h3 className="font-heading text-3xl font-semibold text-brand-ink">
                  Better data beats more noise.
                </h3>
                <p className="text-sm leading-7 text-brand-brown/80">
                  The PRD calls for a cleaner buyer journey: live search, weather context,
                  verification, admin moderation, and reminders that keep stale listings from
                  quietly rotting in the directory.
                </p>
                <p className="text-sm leading-7 text-brand-brown/80">
                  That is what this build is optimising for from the homepage onwards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
              Car Boot Tips
            </div>
            <h2 className="font-heading mt-2 text-4xl font-semibold text-brand-ink">
              Editorial content that strengthens trust and long-tail SEO
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
