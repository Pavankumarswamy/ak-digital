import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { ArrowLeft, Inbox, Loader2, LogOut, Package } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Orders — AK Digital Hub" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      
      if (u) {
        const subsRef = ref(db, 'user_submissions');
        onValue(subsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const userSubs = Object.keys(data)
              .map(key => ({ id: key, ...data[key] }))
              .filter(s => s.userId === u.uid)
              .reverse();
            setSubs(userSubs);
          } else {
            setSubs([]);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="floating-orb h-72 w-72 bg-[oklch(0.55_0.22_230)] -top-10 -left-10" />
      <div className="floating-orb h-96 w-96 bg-[oklch(0.5_0.22_280)] bottom-0 -right-10" style={{ animationDelay: "-6s" }} />

      <div className="relative mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to site
            </Link>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Package className="h-8 w-8 text-neon" /> My Orders
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Logged in as {user.email}
            </p>
          </div>
          <button 
            onClick={() => signOut(auth)} 
            className="btn-ghost-neon !py-2 !px-4 text-xs h-fit"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Inbox className="h-5 w-5 text-neon" /> My Orders
            </h3>
            <div className="text-xs text-muted-foreground bg-black/20 px-3 py-1 rounded-full border border-white/5">
              {subs.length} total entries
            </div>
          </div>
          
          {subs.length === 0 ? (
            <div className="px-6 py-20 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <Inbox className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-1">No applications found</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                You haven't applied for any services yet. Head back to the home page to explore our offerings.
              </p>
              <Link to="/" className="mt-6 btn-neon !py-2 !px-6">
                Explore Services
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {subs.map((s) => (
                <li key={s.id} className="px-6 py-6 hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate({ to: '/track', search: { id: s.id } as any })}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="rounded-md bg-gradient-to-r from-[oklch(0.85_0.18_210/0.2)] to-[oklch(0.55_0.2_265/0.2)] border border-[oklch(0.85_0.18_210/0.3)] px-3 py-1.5 text-xs font-bold text-neon tracking-wide shadow-[0_0_10px_oklch(0.85_0.18_210/0.1)]">
                          {s.service}
                        </span>
                        <span className="text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded-md border border-white/5">
                          {new Date(s.createdAt).toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                          s.status === 'Completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          s.status === 'Processing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          Status: {s.status || "Pending"}
                        </span>
                      </div>
                      <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3 bg-black/20 p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                        {Object.entries(s.data || {}).map(([k, v]) => {
                          if (k.toLowerCase().includes('file') || k.toLowerCase().includes('image') || (typeof v === 'string' && v.startsWith('http'))) {
                             return (
                               <div key={k} className="flex flex-col gap-1 overflow-hidden">
                                 <span className="text-muted-foreground/70 uppercase text-[10px] font-bold tracking-wider truncate">{k}</span>
                                 <a href={v as string} target="_blank" rel="noreferrer" className="text-neon text-xs hover:underline truncate" onClick={(e) => e.stopPropagation()}>View Document ↗</a>
                               </div>
                             );
                          }
                          return (
                            <div key={k} className="flex flex-col gap-1 overflow-hidden">
                              <span className="text-muted-foreground/70 uppercase text-[10px] font-bold tracking-wider truncate">{k}</span>
                              <span className="text-foreground/90 font-medium truncate" title={v as string}>{v as React.ReactNode}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
