import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BlogCard } from "@/components/blog-card";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Article not found",
    };
  }

  return {
    title: post.title,
    description: post.seoDescription,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(params.slug),
    getBlogPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const related = allPosts.filter((entry) => entry.slug !== post.slug).slice(0, 2);

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/car-boot-tips"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand-brown/75"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Car Boot Tips
        </Link>

        <article className="overflow-hidden rounded-[2rem] border border-brand-brown/10 bg-white shadow-field">
          <div className="relative h-72">
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6 p-8">
            <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
              {post.category} • {post.readingTime}
            </div>
            <h1 className="font-heading text-5xl font-semibold text-brand-ink">
              {post.title}
            </h1>
            <div className="space-y-5 text-base leading-8 text-brand-brown/85">
              {post.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>

        <div className="mt-10 space-y-5">
          <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
            Read next
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {related.map((entry) => (
              <BlogCard key={entry.id} post={entry} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
