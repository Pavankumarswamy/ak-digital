import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms-and-conditions")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-24 md:py-32 relative overflow-hidden">
      <div className="floating-orb h-72 w-72 bg-[oklch(0.55_0.22_230)] -top-10 -left-10" />
      <div className="mx-auto max-w-3xl px-4 relative z-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="glass p-8 md:p-12 rounded-2xl">
          <h1 className="text-3xl font-bold gradient-text mb-2">Terms & Conditions</h1>
          <p className="text-xs text-muted-foreground mb-6">Effective Date: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p>Welcome to AK Digital Solutions. By accessing our website or engaging our services, you agree to comply with the following Terms and Conditions.</p>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Service Scope</h2>
              <p>AK Digital Solutions provides custom software development, web design, and digital consulting services. The specific scope, deliverables, and timelines for your project will be detailed in a separate mutual agreement or project proposal.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Project Workflow and Delivery Timelines</h2>
              <p>We follow a structured workflow encompassing planning, development, testing, and deployment. While we strive to meet all projected delivery timelines, dates are estimates based on the prompt receipt of required materials and feedback from the client. Delays on the client's end may adjust the final delivery schedule.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Payment Terms</h2>
              <p>Payments are processed securely via our designated payment gateways. Projects typically require an upfront advance payment before work commences, with subsequent milestone payments as detailed in your project proposal. Final deliverables will only be handed over upon receipt of full payment.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Client Responsibilities</h2>
              <p>To ensure a smooth project execution, the client agrees to provide necessary resources, content, brand assets, and feedback in a timely manner. The client guarantees that they own the rights to any materials provided to us for use in the project.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Revision Limitations</h2>
              <p>We include a specific number of revision rounds during the project phase, as outlined in your proposal. Requests for major structural changes or additional features outside the original scope will be billed separately as additional work.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Intellectual Property Ownership</h2>
              <p>Upon full and final payment, the intellectual property rights for the final custom deliverables (such as website code and custom graphics) are transferred to the client. AK Digital Solutions retains the right to use the completed project in our portfolio and marketing materials unless a Non-Disclosure Agreement (NDA) is signed. We also retain ownership of any pre-existing proprietary code libraries or templates used during development.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Prohibited Usage</h2>
              <p>You may not use our services or website for any unlawful, fraudulent, or malicious activities. You agree not to attempt unauthorized access to our systems or disrupt our server infrastructure.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Liability Limitations</h2>
              <p>AK Digital Solutions will deliver services with professional care and skill. However, we are not liable for any indirect, incidental, or consequential damages (including loss of profits or data) arising from the use or inability to use our deliverables, third-party software failures, or server downtimes.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Dispute Resolution</h2>
              <p>Any disputes arising from these terms or our services shall first be attempted to be resolved amicably through mutual discussion. If a resolution cannot be reached, the dispute shall be subject to the exclusive jurisdiction of the courts located in our operating region.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Termination Conditions</h2>
              <p>Either party may terminate the project if the other party breaches a material term of the agreement and fails to correct it within a reasonable timeframe. Upon termination, the client is responsible for paying for all work completed up to the termination date.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
