import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import { buildWhatsAppLink, PHONE_NUMBER } from "@/lib/services";
import { saveContact } from "@/lib/storage";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    saveContact({ ...form, createdAt: new Date().toISOString() });
    setDone(true);
    setSubmitting(false);
    setForm({ name: "", email: "", phone: "", message: "" });
    setTimeout(() => setDone(false), 3500);
  };

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neon">
            Get In Touch
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We'd love to help. Reach out via the form, phone, or WhatsApp.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[oklch(0.85_0.18_210/0.15)] text-neon">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Phone
                  </div>
                  <div className="font-medium text-sm text-muted-foreground">Arunkumar Thirumurthy</div>
                  <a href={`tel:${PHONE_NUMBER}`} className="font-medium hover:text-neon">
                    {PHONE_NUMBER}
                  </a>
                </div>
              </div>
            </div>

            <a
              href={buildWhatsAppLink(
                "Hello AK DIGITAL HUB, I'd like to know more about your services."
              )}
              target="_blank"
              rel="noreferrer"
              className="glass block rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_oklch(0.85_0.18_210/0.25)]"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 overflow-hidden rounded-xl border border-border">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJCXHUHLcHEK1YfnI5LoabzhIzSfWAZHDtnw&s" alt="WhatsApp Logo" className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    WhatsApp
                  </div>
                  <div className="font-medium">+91 9363351084</div>
                </div>
              </div>
            </a>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[oklch(0.85_0.18_210/0.15)] text-neon">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email
                  </div>
                  <div className="font-medium text-sm break-all">akdigitalhubudt@gmail.com</div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[oklch(0.85_0.18_210/0.15)] text-neon">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Address
                  </div>
                  <div className="font-medium">Madurai, Tamil Nadu, India</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="glass grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:text-neon"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="glass lg:col-span-3 rounded-2xl p-6 sm:p-8 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { k: "name", l: "Your Name", t: "text" },
                { k: "email", l: "Email", t: "email" },
                { k: "phone", l: "Phone", t: "tel" },
              ].map((f) => (
                <div key={f.k} className={f.k === "phone" ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {f.l}
                  </label>
                  <input
                    required
                    type={f.t}
                    value={(form as Record<string, string>)[f.k]}
                    onChange={(e) =>
                      setForm({ ...form, [f.k]: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p
                className={`text-sm transition-opacity ${
                  done ? "text-neon opacity-100" : "opacity-0"
                }`}
              >
                ✓ Message received — we'll be in touch shortly.
              </p>
              <button type="submit" disabled={submitting} className="btn-neon">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send Message <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
