import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/refund-cancellation")({
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen bg-background py-24 md:py-32 relative overflow-hidden">
      <div className="floating-orb h-72 w-72 bg-[oklch(0.55_0.22_230)] -top-10 -right-10" />
      <div className="mx-auto max-w-3xl px-4 relative z-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="glass p-8 md:p-12 rounded-2xl">
          <h1 className="text-3xl font-bold gradient-text mb-2">Refund & Cancellation Policy</h1>
          <p className="text-xs text-muted-foreground mb-6">Effective Date: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p>At AK Digital Solutions, we strive to ensure clarity and fairness in our billing processes. Please read our Refund & Cancellation Policy carefully.</p>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Advance Payment Rules</h2>
              <p>To initiate a project, we require a non-refundable advance payment. This fee covers initial consultations, project planning, and the allocation of resources required to start your work.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Cancellation Conditions</h2>
              <p>You may submit a request to cancel a project at any time. Cancellation requests must be made in writing via our official contact channels. If you choose to cancel after work has commenced, you will be billed for the pro-rated hours of work completed up to the date of cancellation.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Milestone Payment Handling</h2>
              <p>For larger projects structured around milestones, payments made for completed and approved milestones are strictly non-refundable. Once a milestone is signed off and development continues to the next phase, the funds for the approved phase are secured.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Refund Eligibility</h2>
              <p>Refunds are evaluated on a case-by-case basis and are generally only approved in the event that AK Digital Solutions is entirely unable to deliver the agreed-upon initial scope of work due to internal technical limitations, before significant development has occurred.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Non-Refundable Scenarios</h2>
              <p>Refunds will <strong>not</strong> be provided under the following circumstances:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Change of mind or pivoting of business ideas after the project has started.</li>
                <li>Delays caused by the client's failure to provide required content, assets, or feedback.</li>
                <li>Dissatisfaction with design elements if the client has already approved the design mockups.</li>
                <li>Services involving third-party purchases (such as domain names, hosting, or external API licenses) made on the client's behalf.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Refund Processing Timeline</h2>
              <p>If a refund is approved by our management team, it will be processed and credited back to the original method of payment within 7 to 10 business days, depending on your bank or payment provider's processing times.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Dispute Handling</h2>
              <p>If you have concerns regarding your billing or the quality of service, we encourage you to contact our support team immediately. We are committed to working with you to find a fair and reasonable solution before escalating to payment gateway disputes or chargebacks.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
