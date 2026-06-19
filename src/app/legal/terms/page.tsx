export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose prose-invert">
      <h1 className="font-display text-4xl font-semibold gold-gradient-text">Terms of Service</h1>
      <div className="mt-8 space-y-6 text-text-secondary">
        <section>
          <h2 className="text-xl font-medium text-text-primary">1. Eligibility</h2>
          <p>You must be at least 18 years of age to use HelloLilly. By accessing this site, you confirm you meet this requirement.</p>
        </section>
        <section>
          <h2 className="text-xl font-medium text-text-primary">2. Advertiser Responsibilities</h2>
          <p>Advertisers must provide accurate information, upload only content they own or have rights to, and complete video verification before publishing listings.</p>
        </section>
        <section>
          <h2 className="text-xl font-medium text-text-primary">3. Prohibited Content</h2>
          <p>Content involving minors, trafficking, non-consensual activity, or illegal services is strictly prohibited and will result in immediate account termination.</p>
        </section>
        <section>
          <h2 className="text-xl font-medium text-text-primary">4. Moderation</h2>
          <p>HelloLilly reserves the right to remove any listing, suspend accounts, or reject verification at our discretion without refund.</p>
        </section>
        <section>
          <h2 className="text-xl font-medium text-text-primary">5. Payments</h2>
          <p>Premium plans are activated manually after payment verification via WhatsApp. Subscriptions expire after 30 days unless renewed.</p>
        </section>
      </div>
    </div>
  );
}
