import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogPost } from "@/types";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-brand-brown/10 bg-white shadow-[0_16px_40px_rgba(35,23,16,0.06)]">
      <div className="relative h-48">
        <Image
          src={post.heroImage}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-brand-brown/60">
          <span>{post.category}</span>
          <span>{post.readingTime}</span>
        </div>
        <h3 className="font-heading text-2xl font-semibold text-brand-ink">
          {post.title}
        </h3>
        <p className="text-sm leading-7 text-brand-brown/80">{post.excerpt}</p>
        <Link
          href={`/car-boot-tips/${post.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand-ink"
        >
          Read article
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
