import { Award, Clock, HeartHandshake, ShieldCheck } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Trusted & Verified", desc: "Verified govt-grade processes." },
  { icon: Clock, title: "Lightning Fast", desc: "Most services delivered same-day." },
  { icon: HeartHandshake, title: "Affordable Pricing", desc: "Transparent, no hidden fees." },
  { icon: Award, title: "Expert Support", desc: "Dedicated specialists for every case." },
];

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neon animate-fade-up">
              About Us
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
              A Modern{" "}
              <span className="gradient-text">Digital Service Center</span>{" "}
              You Can Rely On
            </h2>
            <p className="mt-5 text-muted-foreground animate-fade-up" style={{ animationDelay: "0.2s" }}>
              AK DIGITAL HUB is your one-stop destination for fast, reliable, and
              affordable online government & business services. We combine
              technology with personal care — so applying for a PAN, GST, or
              Voter ID feels effortless.
            </p>
            <p className="mt-3 text-muted-foreground animate-fade-up" style={{ animationDelay: "0.3s" }}>
              From individual citizens to growing shops and businesses,
              thousands trust us to handle their paperwork while they focus on
              what matters.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {[
                ["98%", "Success Rate"],
                ["24h", "Avg. Turnaround"],
                ["10K+", "Applications"],
                ["5★", "Avg. Rating"],
              ].map(([v, l], i) => (
                <div 
                  key={l} 
                  className="glass group rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 cursor-pointer"
                >
                  <div className="text-2xl font-bold gradient-text font-display transition-transform duration-300 group-hover:scale-110 origin-left">
                    {v}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="glass group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-primary/15 hover:border-primary/40 cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${i * 0.15 + 0.2}s` }}
                >
                  {/* Hover background gradient glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-primary/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold transition-colors group-hover:text-primary">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground transition-colors group-hover:text-foreground/80">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
