import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-brand-brown/10 bg-white p-10 text-center shadow-field">
        <h1 className="font-heading text-7xl font-semibold text-brand-ink">404</h1>
        <h2 className="mt-4 font-heading text-3xl text-brand-ink">
          That field is not on today&apos;s map
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-brand-brown/80">
          The page you were looking for has moved, expired, or never made it through the
          early-morning setup.
        </p>
        <Link href="/">
          <Button className="mt-8 rounded-full bg-brand-ink text-white hover:bg-brand-brown">
            Return home
          </Button>
        </Link>
      </div>
    </div>
  );
}
