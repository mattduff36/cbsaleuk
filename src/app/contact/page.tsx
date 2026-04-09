export default function ContactPage() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-brand-brown/10 bg-white p-8 shadow-field">
        <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
          Contact
        </div>
        <h1 className="font-heading mt-3 text-5xl font-semibold text-brand-ink">
          Get in touch
        </h1>
        <p className="mt-4 text-sm leading-7 text-brand-brown/80">
          For listing support, verification questions, premium plan queries, or launch
          feedback, email <a className="font-semibold text-brand-ink" href="mailto:hello@carbootsale.com">hello@carbootsale.com</a>.
        </p>
      </div>
    </section>
  );
}
