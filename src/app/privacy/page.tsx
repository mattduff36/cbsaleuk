export default function PrivacyPage() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-brand-brown/10 bg-white p-8 shadow-field">
        <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
          Privacy
        </div>
        <h1 className="font-heading mt-3 text-5xl font-semibold text-brand-ink">
          Privacy policy
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-brand-brown/80">
          <p>
            The site stores only the information needed to run organiser accounts,
            manage listings, and process premium subscriptions. We are intentionally not
            designing this product around third-party ad clutter or heavy behavioural tracking.
          </p>
          <p>
            Account details, listing content, and subscription state are used to operate the
            marketplace and contact organisers about their own listings.
          </p>
        </div>
      </div>
    </section>
  );
}
