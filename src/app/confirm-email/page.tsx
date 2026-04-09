import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConfirmEmail({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] border border-brand-brown/10 bg-white p-8 text-center shadow-field">
        <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
          Email confirmation
        </div>
        <h1 className="font-heading mt-3 text-4xl font-semibold text-brand-ink">
          {token ? "Confirmation link received" : "Missing confirmation token"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-brand-brown/80">
          The Supabase-ready email confirmation route is wired into the build plan. In this
          demo-backed environment, confirmation links are acknowledged but not enforced.
        </p>
        <div className="mt-8">
          <Link href="/login">
            <Button className="rounded-full bg-brand-ink text-white hover:bg-brand-brown">
              Go to sign in
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
