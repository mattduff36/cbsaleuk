import type { Metadata } from "next";
import ListingCard from "@/components/listing-card";
import { SearchMapPanel } from "@/components/search-map-panel";
import { searchListings } from "@/lib/data";

type SearchPageProps = {
  searchParams: {
    location?: string;
    radius?: string;
    dayOfWeek?: string;
    lat?: string;
    lng?: string;
  };
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const location = searchParams.location || "the UK";

  return {
    title: `Car Boot Sales near ${location}`,
    description: `Search car boot sales near ${location} with practical listing details, verified organisers, and premium featured results.`,
  };
}

export default async function SearchResults({ searchParams }: SearchPageProps) {
  const location = searchParams.location || "United Kingdom";
  const radius = Number(searchParams.radius || "25");
  const lat = searchParams.lat ? Number(searchParams.lat) : undefined;
  const lng = searchParams.lng ? Number(searchParams.lng) : undefined;
  const dayOfWeek = searchParams.dayOfWeek;

  const results = await searchListings({
    location,
    radius,
    dayOfWeek,
    lat,
    lng,
  });

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-brand-brown/10 bg-white/80 p-8 shadow-[0_20px_55px_rgba(35,23,16,0.07)]">
          <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
            Search results
          </div>
          <h1 className="font-heading mt-3 text-4xl font-semibold text-brand-ink sm:text-5xl">
            Car boot sales near {location}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-brown/80">
            {results.length} listings matched within {radius} miles
            {dayOfWeek && dayOfWeek !== "all" ? ` for ${dayOfWeek}` : ""}.
            Featured and verified organisers are weighted to the top.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            {results.length > 0 ? (
              results.map((sale) => <ListingCard key={sale.id} sale={sale} />)
            ) : (
              <div className="glass-card p-8">
                <h2 className="font-heading text-3xl text-brand-ink">
                  No live sales matched that search
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-brown/80">
                  Try a broader town or city, increase the radius, or remove the day filter
                  to widen the field.
                </p>
              </div>
            )}
          </div>

          <SearchMapPanel location={location} lat={lat} lng={lng} results={results} />
        </div>
      </div>
    </section>
  );
}
