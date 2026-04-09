export default function TermsPage() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-brand-brown/10 bg-white p-8 shadow-field">
        <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
          Terms
        </div>
        <h1 className="font-heading mt-3 text-5xl font-semibold text-brand-ink">
          Terms of use
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-brand-brown/80">
          <p>
            Organisers are responsible for keeping listing content accurate, lawful, and up to
            date. Premium features are tied to an active subscription and may be removed if a
            subscription lapses or a listing breaches moderation guidelines.
          </p>
          <p>
            The site may verify listings, request confirmation updates, and suspend stale
            or misleading profiles to protect buyers using the directory.
          </p>
        </div>
      </div>
    </section>
  );
}
