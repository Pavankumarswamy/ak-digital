import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export function LoadingScreen() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 700);
    return () => clearTimeout(t);
  }, []);
  if (done) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-background transition-opacity">
      <div className="flex flex-col items-center gap-4">
          <img 
            src="https://i.ibb.co/n8r45Wn4/ffdedfa4-9854-4edf-a2a6-bd14dab999c2.jpg" 
            alt="AK Digital Hub Logo" 
            className="h-16 w-16 rounded-full object-cover border border-[oklch(0.85_0.18_210/0.3)] shadow-[0_0_40px_oklch(0.85_0.18_210/0.6)] animate-pulse-glow" 
          />
        <div className="font-display text-sm tracking-[0.3em] text-neon">
          AK DIGITAL HUB
        </div>
      </div>
    </div>
  );
}
