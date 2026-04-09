import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarPlus2,
  CloudSun,
  Compass,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BlogCard } from "@/components/blog-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListingByIdOrSlug, getRelatedBlogPosts } from "@/lib/data";
import { generateGoogleCalendarUrl, createCalendarEvent, formatDate, formatTime } from "@/lib/utils";
import { getWeatherSummary } from "@/lib/weather";

type SaleDetailProps = {
  params: {
    id: string;
  };
};

const amenityLabels = [
  ["hasToilets", "Toilets"],
  ["hasHotFood", "Hot food"],
  ["hasColdDrinks", "Cold drinks"],
  ["hasIndoorStalls", "Indoor stalls"],
  ["hasDisabledAccess", "Disabled access"],
  ["petsAllowed", "Pets allowed"],
  ["hasKidsActivities", "Kids activities"],
  ["hasRubbishBins", "Bins on site"],
] as const;

export async function generateMetadata({
  params,
}: SaleDetailProps): Promise<Metadata> {
  const sale = await getListingByIdOrSlug(params.id);

  if (!sale) {
    return {
      title: "Listing not found",
    };
  }

  return {
    title: sale.name,
    description: sale.teaser || sale.description,
  };
}

export default async function SaleDetail({ params }: SaleDetailProps) {
  const sale = await getListingByIdOrSlug(params.id);

  if (!sale) {
    notFound();
  }

  const blogPosts = await getRelatedBlogPosts(sale.slug);
  const weather = getWeatherSummary(
    sale.latitude || 53.8008,
    sale.longitude || -1.5491,
    sale.daysOfWeek?.[0]?.toLowerCase() === "saturday" ? "saturday" : "sunday",
  );

  const calendarEvent = createCalendarEvent(
    {
      name: sale.name,
      location: sale.location,
      address: sale.address,
      daysOfWeek: sale.daysOfWeek,
      startTime: sale.startTime,
      endTime: sale.endTime,
      carPrice: sale.carPrice,
      vanPrice: sale.vanPrice,
      organiserEmail: sale.organiserEmail,
      organiserPhone: sale.organiserPhone,
      otherInfo: sale.otherInfo || undefined,
      what3words: sale.what3words || undefined,
    },
    `https://carbootsale.com/sale/${sale.slug || sale.id}`,
  );

  const amenityChips = amenityLabels.filter(
    ([field]) => Boolean(sale[field as keyof typeof sale]),
  );

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-brand-brown/10 bg-white shadow-field">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[360px]">
              <Image
                src={sale.images?.[0] || "/car-boot-sale.jpg"}
                alt={sale.imageAlt || sale.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 to-transparent" />
              <div className="absolute left-6 top-6 flex flex-wrap gap-2">
                {sale.isVerified && (
                  <Badge className="border-0 bg-white text-brand-ink">
                    <BadgeCheck className="mr-1 h-3.5 w-3.5 text-brand-green" />
                    Verified organiser
                  </Badge>
                )}
                {sale.isFeatured && (
                  <Badge className="border-0 bg-brand-green text-brand-ink">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Featured listing
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-6 p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                {sale.location} • {sale.daysOfWeek.join(", ")}
              </div>
              <h1 className="font-heading text-5xl font-semibold text-brand-ink">
                {sale.name}
              </h1>
              <p className="text-base leading-8 text-brand-brown/80">
                {sale.description}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-brand-cream p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                    Next event
                  </div>
                  <div className="mt-2 font-heading text-2xl text-brand-ink">
                    {sale.nextEventDate ? formatDate(String(sale.nextEventDate)) : "Weekly"}
                  </div>
                  <div className="mt-1 text-sm text-brand-brown/80">
                    {formatTime(sale.startTime)} to {formatTime(sale.endTime)}
                  </div>
                </div>
                <div className="rounded-[1.25rem] bg-brand-cream p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                    Weekend outlook
                  </div>
                  <div className="mt-2 flex items-center gap-2 font-heading text-2xl text-brand-ink">
                    <CloudSun className="h-6 w-6 text-brand-sky" />
                    {weather.tempC}°C
                  </div>
                  <div className="mt-1 text-sm capitalize text-brand-brown/80">
                    {weather.conditionCode.replace(/_/g, " ")}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href={generateGoogleCalendarUrl(calendarEvent)} target="_blank" rel="noreferrer">
                  <Button className="rounded-full bg-brand-ink text-white hover:bg-brand-brown">
                    <CalendarPlus2 className="mr-2 h-4 w-4" />
                    Add to Google Calendar
                  </Button>
                </a>
                <Link href={`/sale/${sale.slug || sale.id}/calendar.ics`}>
                  <Button variant="outline" className="rounded-full border-brand-brown/20 bg-white">
                    Download ICS
                  </Button>
                </Link>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    sale.address,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" className="rounded-full border-brand-brown/20 bg-white">
                    <Compass className="mr-2 h-4 w-4" />
                    Directions
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="glass-card p-8">
              <div className="mb-4 text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                Practical details
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-brand-cream p-4">
                  <div className="flex items-center gap-2 text-sm text-brand-brown/80">
                    <MapPin className="h-4 w-4" />
                    {sale.address}
                  </div>
                  {sale.what3words ? (
                    <div className="mt-3 text-sm text-brand-brown/80">
                      What3Words: <span className="font-semibold">{sale.what3words}</span>
                    </div>
                  ) : null}
                </div>
                <div className="rounded-[1.25rem] bg-brand-cream p-4">
                  <div className="text-sm text-brand-brown/80">
                    Seller entry: <span className="font-semibold">£{sale.carPrice.toFixed(0)} car</span>
                  </div>
                  <div className="mt-2 text-sm text-brand-brown/80">
                    Van entry: <span className="font-semibold">£{sale.vanPrice.toFixed(0)} van</span>
                  </div>
                  <div className="mt-2 text-sm text-brand-brown/80">
                    {sale.freeParking ? "Buyer parking included" : `Parking fee £${sale.parkingFee || 0}`}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {amenityChips.map(([field, label]) => (
                  <div
                    key={field}
                    className="rounded-full border border-brand-brown/10 bg-white px-4 py-2 text-sm text-brand-brown/80"
                  >
                    {label}
                  </div>
                ))}
              </div>
              {sale.eventAnnouncement ? (
                <div className="mt-6 rounded-[1.25rem] border border-brand-green/30 bg-brand-green/10 p-5 text-sm leading-7 text-brand-brown/85">
                  <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                    <Sparkles className="h-4 w-4 text-brand-green" />
                    Organiser update
                  </div>
                  {sale.eventAnnouncement}
                </div>
              ) : null}
            </div>

            {blogPosts.length > 0 ? (
              <div className="space-y-5">
                <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                  Related reading
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {blogPosts.slice(0, 2).map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8">
              <div className="mb-4 text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                Contact organiser
              </div>
              <div className="space-y-4 text-sm text-brand-brown/85">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-brand-green" />
                  <span>
                    {sale.isVerified
                      ? "Verified by admin review"
                      : "Awaiting verification review"}
                  </span>
                </div>
                {sale.showEmail && (
                  <a
                    href={`mailto:${sale.organiserEmail}`}
                    className="flex items-center gap-3 rounded-[1.25rem] bg-brand-cream p-4 hover:bg-brand-cream/80"
                  >
                    <Mail className="h-4 w-4" />
                    {sale.organiserEmail}
                  </a>
                )}
                {sale.showPhone && (
                  <a
                    href={`tel:${sale.organiserPhone}`}
                    className="flex items-center gap-3 rounded-[1.25rem] bg-brand-cream p-4 hover:bg-brand-cream/80"
                  >
                    <Phone className="h-4 w-4" />
                    {sale.organiserPhone}
                  </a>
                )}
                {sale.socialLinks?.website && (
                  <a
                    href={sale.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-brand-ink"
                  >
                    Visit organiser site
                  </a>
                )}
              </div>
            </div>

            <div className="glass-card p-8">
              <div className="mb-4 text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                Listing tier
              </div>
              <div className="font-heading text-3xl text-brand-ink">
                {sale.listingTier === "premium" ? "Premium organiser profile" : "Free organiser profile"}
              </div>
              <p className="mt-3 text-sm leading-7 text-brand-brown/80">
                {sale.listingTier === "premium"
                  ? "This organiser can showcase richer imagery, event announcements, and social links as part of the premium workflow."
                  : "This organiser is using the free tier with the essential profile details surfaced first."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
