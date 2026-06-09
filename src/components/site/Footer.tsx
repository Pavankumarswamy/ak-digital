import { Zap, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PHONE_NUMBER } from "@/lib/services";

export function Footer() {
  return (
    <footer className="relative mt-12 rounded-t-[35px] border-t border-[oklch(0.85_0.18_210/0.25)] bg-background">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[oklch(0.85_0.18_210)] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img 
                src="https://i.ibb.co/n8r45Wn4/ffdedfa4-9854-4edf-a2a6-bd14dab999c2.jpg" 
                alt="AK Digital Hub Logo" 
                className="h-9 w-9 rounded-full object-cover shadow-[0_0_20px_oklch(0.85_0.18_210/0.5)] border border-[oklch(0.85_0.18_210/0.3)]" 
              />
              <span className="font-display text-base font-bold">
                <span className="gradient-text">AK</span>{" "}
                <span className="text-foreground/90">DIGITAL HUB</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Connecting you to the world. Fast, reliable and affordable digital
              services done by trusted experts.
            </p>
            <div className="mt-5 flex gap-2.5">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-[oklch(0.85_0.18_210/0.5)] hover:text-neon"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                ["Home", "/#home"],
                ["About Us", "/#about"],
                ["Services", "/#services"],
                ["Blogs", "/#blogs"],
                ["Contact", "/#contact"],
              ].map(([l, h]) => (
                <li key={l}>
                  <a href={h} className="hover:text-neon">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                ["About Us", "/about"],
                ["Privacy Policy", "/privacy-policy"],
                ["Terms & Conditions", "/terms-and-conditions"],
                ["Refund Policy", "/refund-cancellation"],
              ].map(([l, h]) => (
                <li key={l}>
                  <Link to={h} className="hover:text-neon">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={`tel:${PHONE_NUMBER.replace(/[^0-9+]/g, '')}`} className="hover:text-neon transition-colors">
                  {PHONE_NUMBER}
                </a>
              </li>
              <li>
                <a href="https://wa.me/919363351084" target="_blank" rel="noopener noreferrer" className="hover:text-neon transition-colors">
                  WhatsApp: +91 9363351084
                </a>
              </li>
              <li>
                <a href="mailto:akdigitalhubudt@gmail.com" className="hover:text-neon transition-colors">
                  akdigitalhubudt@gmail.com
                </a>
              </li>
              <li>
                <a href="https://maps.google.com/?q=Madurai,+India" target="_blank" rel="noopener noreferrer" className="hover:text-neon transition-colors">
                  Madurai, India
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} AK Digital Hub. All rights reserved.</p>
          <p>Crafted with neon & care.</p>
        </div>
      </div>
    </footer>
  );
}
