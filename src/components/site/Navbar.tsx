import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Zap, LogOut, User as UserIcon } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthModal } from "./AuthModal";

const links = [
  { label: "Home", href: "/#home" },
  { label: "About Us", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Blogs", href: "/#blogs" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 transition-all duration-300 ${
          scrolled ? "" : ""
        }`}
      >
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-3">
          <a href="/#home" className="flex items-center gap-2.5 group">
            <img 
              src="https://i.ibb.co/n8r45Wn4/ffdedfa4-9854-4edf-a2a6-bd14dab999c2.jpg" 
              alt="AK Digital Hub Logo" 
              className="h-9 w-9 rounded-full object-cover shadow-[0_0_20px_oklch(0.85_0.18_210/0.5)] border border-[oklch(0.85_0.18_210/0.3)]" 
            />
            <span className="font-display text-base font-bold tracking-wide">
              <span className="gradient-text">AK</span>{" "}
              <span className="text-white">DIGITAL HUB</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="relative rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-neon"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/track" className="text-xs font-semibold text-neon px-3 py-1.5 rounded-md border border-[oklch(0.85_0.18_210/0.3)] bg-[oklch(0.85_0.18_210/0.1)] hover:bg-[oklch(0.85_0.18_210/0.2)] transition-colors">
              Track Status
            </Link>
            {user ? (
              <>
                <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border bg-muted rounded-lg px-3 py-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-neon" />
                  {user.email?.split("@")[0]}
                </div>
                <Link to="/dashboard" className="btn-ghost-neon !px-3 !py-1.5 text-xs">
                  My Orders
                </Link>
                <Link to="/admin" className="btn-ghost-neon !px-4 !py-2 text-sm">
                  Admin
                </Link>
                <button
                  onClick={() => signOut(auth)}
                  className="btn-ghost-neon !px-3 !py-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  title="Log Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="btn-neon !px-4 !py-2 text-sm"
                >
                  Log In
                </button>
                <Link to="/admin" className="btn-ghost-neon !px-4 !py-2 text-sm">
                  Admin
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-lg p-2 text-neon"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="glass mt-2 rounded-2xl p-3 md:hidden animate-fade-up">
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    onClick={() => setOpen(false)}
                    href={l.href}
                    className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-neon"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <div className="my-2 border-t border-border" />
              </li>
              <li>
                <Link
                  to="/track"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-neon hover:bg-muted"
                >
                  Track Application Status
                </Link>
              </li>
              {user ? (
                <>
                  <li className="px-3 py-2 text-xs text-muted-foreground">
                    Logged in as {user.email}
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted hover:text-neon"
                    >
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
                    >
                      Admin Panel
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => { signOut(auth); setOpen(false); }}
                      className="block w-full text-left rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-muted"
                    >
                      Log Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      onClick={() => { setAuthModalOpen(true); setOpen(false); }}
                      className="block w-full text-left rounded-lg px-3 py-2.5 text-sm text-neon hover:bg-muted"
                    >
                      Log In / Sign Up
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
                    >
                      Admin Panel
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
