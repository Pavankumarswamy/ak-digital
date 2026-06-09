import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How fast can I get my PAN card?",
    a: "Most new PAN applications are processed within 7–14 working days. We expedite documentation on the same day.",
  },
  {
    q: "Do I need to visit your office?",
    a: "No. The entire process happens online via WhatsApp and our secure forms.",
  },
  {
    q: "What documents are required for GST registration?",
    a: "PAN, Aadhaar, address proof, bank details, and a photo. We'll guide you step-by-step.",
  },
  {
    q: "Are my documents safe?",
    a: "Yes. We follow strict data privacy and only share documents with the relevant government portals.",
  },
  {
    q: "Do you offer support after submission?",
    a: "Absolutely — we track your application until delivery and provide updates via WhatsApp.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neon">
            FAQs
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Got <span className="gradient-text">Questions?</span>
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`glass rounded-2xl transition-all ${
                  isOpen ? "neon-border" : ""
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium sm:text-base">{f.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neon transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-muted-foreground">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
