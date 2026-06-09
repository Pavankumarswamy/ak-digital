import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, Check } from "lucide-react";
import { services as staticServices, buildWhatsAppLink } from "@/lib/services";
import { PanCardModal } from "./PanCardModal";
import { GenericServiceModal } from "./GenericServiceModal";
import { AuthModal } from "./AuthModal";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import * as LucideIcons from "lucide-react";

const getIcon = (iconName: string) => {
  return (LucideIcons as any)[iconName] || LucideIcons.Circle;
};

export function Services() {
  const [openPan, setOpenPan] = useState(false);
  const [openService, setOpenService] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const servicesRef = ref(db, 'services');
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          icon: getIcon(data[key].iconName || 'Circle')
        }));
        setDynamicServices(parsed);
      } else {
        setDynamicServices(staticServices);
      }
    });
    return () => unsubscribe();
  }, []);

  const displayServices = dynamicServices.length > 0 ? dynamicServices : staticServices;

  return (
    <section id="services" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neon">
            What We Offer
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Premium <span className="gradient-text">Digital Services</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need under one roof — handled by trusted experts.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayServices.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => {
                  if (!user) {
                    setAuthModalOpen(true);
                    return;
                  }
                  const isPan = (s.id === "pan" || s.serviceId === "pan") && (!s.customFields || s.customFields.length === 0);
                  isPan ? setOpenPan(true) : setOpenService(s);
                }}
                className="group glass flex flex-col h-full relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[oklch(0.85_0.18_210/0.5)] hover:shadow-[0_0_40px_oklch(0.85_0.18_210/0.25)] animate-fade-up cursor-pointer"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="aspect-[16/9] w-full shrink-0 overflow-hidden">
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6 relative">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[oklch(0.55_0.22_230/0.15)] blur-3xl transition-opacity group-hover:bg-[oklch(0.55_0.22_230/0.3)]" />

                  {/* Icon removed */}

                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {s.description}
                  </p>

                  <ul className="mt-4 mb-6 space-y-1.5 flex-1">
                    {s.bullets?.map((b: string) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-border/10 w-full">
                    <button
                      className="btn-neon w-full justify-center !py-2.5 text-sm"
                    >
                      Apply Now <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PanCardModal open={openPan} onClose={() => setOpenPan(false)} />
      <GenericServiceModal
        service={openService}
        onClose={() => setOpenService(null)}
      />
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </section>
  );
}
