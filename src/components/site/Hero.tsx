import { ArrowRight, MessageCircle, Sparkles, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

function StatCounter({ value }: { value: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const numericValue = match ? parseInt(match[1]) : NaN;
  const suffix = match ? match[2] : "";
  const isNumeric = !isNaN(numericValue);
  
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isNumeric) return;

    let startTime: number | null = null;
    let animationFrameId: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      const percentage = Math.min(progress / duration, 1);
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(easeOut * numericValue));

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(numericValue);
      }
    };

    const startAnimation = () => {
      startTime = null;
      setCount(0);
      animationFrameId = requestAnimationFrame(animate);
    };

    startAnimation();
    const intervalId = setInterval(startAnimation, 10000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
    };
  }, [numericValue, isNumeric]);

  if (!isNumeric) return <>{value}</>;
  
  return <>{count}{suffix}</>;
}

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <img src="/hero_bg.png" alt="Hero Background" className="h-full w-full object-cover opacity-15 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
      </div>

      {/* Floating orbs */}
      <div className="floating-orb h-72 w-72 bg-primary/20 -top-10 -left-10" />
      <div
        className="floating-orb h-96 w-96 bg-secondary/30 top-1/3 -right-20"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="floating-orb h-64 w-64 bg-neon/20 bottom-0 left-1/3"
        style={{ animationDelay: "-3s" }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <div
          className="glass mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs animate-fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          <Sparkles className="h-3.5 w-3.5 text-neon" />
          <span className="text-muted-foreground">
            Connecting You To The World
          </span>
        </div>

        <h1
          className="mx-auto max-w-4xl text-4xl font-bold leading-[1.05] sm:text-5xl md:text-7xl animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          Your Trusted{" "}
          <span className="gradient-text">Digital Service</span> Partner
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg animate-fade-up"
          style={{ animationDelay: "0.25s" }}
        >
          Fast, reliable and affordable online services — PAN, GST, Employment,
          Voter ID, and more. Done by experts. Delivered with care.
        </p>

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "0.35s" }}
        >
          <a href="#services" className="btn-neon animate-pulse-glow">
            Explore Services <ArrowRight className="h-4 w-4" />
          </a>
          <Link to="/track" className="btn-ghost-neon border-neon/30 text-neon hover:bg-neon/10">
            <Search className="h-4 w-4" /> Track Status
          </Link>
          <a href="#contact" className="btn-ghost-neon">
            <MessageCircle className="h-4 w-4" /> Contact Now
          </a>
        </div>

        {/* Stats */}
        <div
          className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-up"
          style={{ animationDelay: "0.5s" }}
        >
          {[
            { v: "10K+", l: "Happy Clients" },
            { v: "15+", l: "Services" },
            { v: "24/7", l: "Support" },
            { v: "5★", l: "Rated" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-5">
              <div className="font-display text-2xl font-bold gradient-text">
                <StatCounter value={s.v} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
