export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold gold-gradient-text">Privacy Policy</h1>
      <div className="mt-8 space-y-6 text-text-secondary">
        <p>HelloLilly collects email addresses, profile information, and uploaded media to operate the classified platform.</p>
        <p>Verification videos are stored securely and accessible only to administrators. They are never displayed publicly.</p>
        <p>We use Supabase for data storage and Resend for transactional emails. We do not sell personal data to third parties.</p>
        <p>Contact us to request data deletion by emailing the address listed in your account settings.</p>
      </div>
    </div>
  );
}
