import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/services";

export function FloatingActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <a
        href={buildWhatsAppLink("Hello AK DIGITAL HUB, I need assistance.")}
        target="_blank"
        rel="noreferrer"
        className="block h-14 w-14 rounded-full shadow-[0_0_24px_oklch(0.7_0.18_150/0.5)] transition-transform hover:scale-105 animate-pulse-glow overflow-hidden border border-border"
        aria-label="WhatsApp"
      >
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJCXHUHLcHEK1YfnI5LoabzhIzSfWAZHDtnw&s" 
          alt="WhatsApp Logo" 
          className="h-full w-full object-cover" 
        />
      </a>
      {visible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="glass grid h-11 w-11 place-items-center rounded-full text-neon hover:border-[oklch(0.85_0.18_210/0.5)]"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
