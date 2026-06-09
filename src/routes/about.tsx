import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-24 md:py-32 relative overflow-hidden">
      <div className="floating-orb h-72 w-72 bg-[oklch(0.55_0.22_230)] -top-10 -left-10" />
      <div className="mx-auto max-w-3xl px-4 relative z-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="glass p-8 md:p-12 rounded-2xl">
          <h1 className="text-3xl font-bold gradient-text mb-6">About Us</h1>
          
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Welcome to AK Digital Solutions</h2>
              <p>At AK Digital Solutions, we are dedicated to helping businesses and individuals navigate the digital landscape with confidence. We specialize in providing comprehensive software development, digital services, and technical solutions designed to streamline operations, enhance online presence, and drive sustainable growth.</p>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Our Story</h2>
              <p>Founded with a vision to simplify technology for modern businesses, AK Digital Solutions began as a focused initiative to bridge the gap between complex digital challenges and practical, user-friendly solutions. Over time, we have evolved into a trusted partner for clients seeking reliable digital transformation, custom software development, and seamless online integrations.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Mission and Vision</h2>
              <p><strong>Our Mission:</strong> To deliver high-quality, accessible, and scalable digital services that empower our clients to achieve their goals efficiently and securely.</p>
              <p className="mt-2"><strong>Our Vision:</strong> To be a leading force in the digital services industry, recognized for our commitment to transparency, technical excellence, and unwavering customer support.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Services We Offer</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Custom Web & Application Development:</strong> Building responsive, robust, and scalable applications from the ground up.</li>
                <li><strong>Digital Integrations & Automations:</strong> Connecting platforms and automating workflows to save you time.</li>
                <li><strong>E-commerce Solutions:</strong> Setting up secure, optimized, and conversion-ready online stores.</li>
                <li><strong>Consulting & Support:</strong> Offering expert guidance and ongoing technical maintenance to keep your digital assets running smoothly.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Technologies and Tools We Use</h2>
              <p>We stay at the forefront of modern technology to ensure the best outcomes for our projects. Our technology stack includes industry-standard frameworks, secure payment gateways like Cashfree, modern frontend technologies (such as React and Tailwind CSS), and robust backend databases (like Firebase and scalable cloud infrastructure). We choose the right tools for the job to ensure speed, security, and reliability.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Our Customer-Focused Approach</h2>
              <p>Your success is our priority. We believe in collaborative partnerships, which means we listen closely to your needs, provide transparent updates throughout the project lifecycle, and tailor our strategies to align with your specific objectives.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Commitment to Quality and Support</h2>
              <p>Quality is not just a buzzword for us; it is the foundation of our workflow. From rigorous testing to responsive post-launch support, AK Digital Solutions is committed to delivering digital products that perform flawlessly. Our dedicated support channels are always open to assist you with any technical inquiries or troubleshooting needs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
