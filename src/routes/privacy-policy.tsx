import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-24 md:py-32 relative overflow-hidden">
      <div className="floating-orb h-72 w-72 bg-[oklch(0.55_0.22_230)] -top-10 -right-10" />
      <div className="mx-auto max-w-3xl px-4 relative z-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="glass p-8 md:p-12 rounded-2xl">
          <h1 className="text-3xl font-bold gradient-text mb-2">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mb-6">Effective Date: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p>At AK Digital Solutions, protecting your privacy is a priority. This Privacy Policy outlines how we collect, use, and protect your information when you interact with our website and services.</p>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
              <p>We collect information that you voluntarily provide to us when you inquire about our services, fill out a contact form, or create an account. This includes:</p>
              <ul className="list-disc pl-5 mt-1">
                <li><strong>Personal Details:</strong> Name, email address, phone number, and company name.</li>
                <li><strong>Project Data:</strong> Information relevant to the digital services you require from us.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Payment Information Handling</h2>
              <p>For processing transactions, we utilize secure, industry-standard third-party payment gateways (such as Cashfree). <strong>We do not store or process your credit card numbers, UPI PINs, or bank account passwords on our servers.</strong> All payment data is encrypted and handled directly by our payment gateway partners in compliance with financial security standards.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Cookies and Analytics Usage</h2>
              <p>We use cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, and understand how visitors interact with our platform. This data is anonymized and helps us optimize our website's performance and user interface. You can manage your cookie preferences through your browser settings.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Third-Party Integrations</h2>
              <p>To deliver our services effectively, we may use third-party tools (e.g., cloud hosting providers, customer relationship management software, and analytics services). We only partner with reputable third parties that adhere to strict data protection standards. We do not sell, rent, or trade your personal information to external marketers.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Storage and Protection</h2>
              <p>We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your data is stored on secure servers with restricted access protocols.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Communication Permissions</h2>
              <p>By providing your contact information, you consent to receive communications regarding your project, service updates, and billing. You may occasionally receive promotional emails about new services; you can opt out of these promotional communications at any time by clicking the "unsubscribe" link.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Your User Rights</h2>
              <p>You have the right to request access to the personal data we hold about you, ask for corrections to inaccurate data, or request the deletion of your data, subject to legal and contractual obligations. To exercise these rights, please contact us directly.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Policy Updates</h2>
              <p>We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We encourage you to review this page occasionally. Continued use of our services constitutes acceptance of the revised policy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
