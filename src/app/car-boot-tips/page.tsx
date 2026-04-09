import type { Metadata } from "next";
import { BlogCard } from "@/components/blog-card";
import { getBlogPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Car Boot Tips",
  description:
    "Buyer guides, organiser advice, and trust-focused editorial content for UK car boot sales.",
};

export default async function CarBootTipsPage() {
  const posts = await getBlogPosts();

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-[2rem] border border-brand-brown/10 bg-white/80 p-8 shadow-[0_20px_55px_rgba(35,23,16,0.07)]">
          <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
            Editorial hub
          </div>
          <h1 className="font-heading mt-3 text-5xl font-semibold text-brand-ink">
            Car Boot Tips
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-brown/80">
            Long-tail SEO content, buyer checklists, and organiser guidance that supports
            the cleaner product direction behind the site.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
