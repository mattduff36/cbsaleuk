"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

export default function AdminBlogAssistantPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [topic, setTopic] = useState("How to check whether a car boot sale is still on");
  const [draft, setDraft] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router, user]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const response = await fetch("/api/blog/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await response.json();
    setDraft(data);
    setIsGenerating(false);
  };

  if (authLoading || !isAuthenticated || user?.role !== "admin") {
    return <div className="px-4 py-16 text-center">Loading blog assistant...</div>;
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="glass-card p-8">
          <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
            Blog assistant
          </div>
          <h1 className="font-heading mt-3 text-5xl font-semibold text-brand-ink">
            Draft SEO-friendly content angles
          </h1>
          <div className="mt-6 flex gap-3">
            <Input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="h-12 rounded-2xl"
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-full bg-brand-ink text-white hover:bg-brand-brown"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        {draft && (
          <div className="glass-card space-y-6 p-8">
            <h2 className="font-heading text-3xl text-brand-ink">{draft.title}</h2>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                Outline
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-brown/80">
                {draft.summary.map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
                Suggested headings
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-brown/80">
                {draft.suggestedHeadings.map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
