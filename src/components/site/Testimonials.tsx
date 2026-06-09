import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

const initialTestimonials = [
  {
    name: "Arun Kumar",
    role: "Shop Owner",
    text: "AK Digital Hub got my GST done in 24 hours. Smooth, fast, and reliable!",
    initials: "AK",
  },
  {
    name: "Priya Sundaram",
    role: "Student",
    text: "Got my new PAN card without leaving home. Highly recommended.",
    initials: "PS",
  },
  {
    name: "Ravi Mohan",
    role: "Entrepreneur",
    text: "Brilliant service. They handle everything so I can focus on my business.",
    initials: "RM",
  },
];

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>(initialTestimonials);

  useEffect(() => {
    const tRef = ref(db, 'testimonials');
    const unsubscribe = onValue(tRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTestimonials(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neon animate-fade-up">
            Loved by clients
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            What Our <span className="gradient-text">Customers Say</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.id || t.name}
              className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="mb-3 flex gap-0.5 text-neon">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-white/90">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.85_0.18_210)] to-[oklch(0.55_0.2_265)] text-sm font-bold text-[oklch(0.13_0.05_260)]">
                  {t.initials || t.name.split(" ").map((w: any) => w[0]).join("").substring(0, 2).toUpperCase() || "C"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/60">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
