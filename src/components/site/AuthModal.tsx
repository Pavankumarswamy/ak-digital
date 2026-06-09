import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const resetAndClose = () => {
    setEmail("");
    setPassword("");
    setIsRegistering(false);
    onClose();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
      }
      resetAndClose();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in with Google!");
      resetAndClose();
    } catch (error: any) {
      toast.error(error.message || "An error occurred with Google Sign-In");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && resetAndClose()}>
      <DialogContent className="glass border-[oklch(0.85_0.18_210/0.25)] p-0 sm:max-w-md overflow-hidden">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[oklch(0.85_0.18_210)] to-transparent" />
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text">
              {isRegistering ? "Create Account" : "Welcome Back"}
            </DialogTitle>
            <DialogDescription>
              {isRegistering
                ? "Sign up to access premium services."
                : "Log in to apply for services and track your applications."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-neon w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRegistering ? (
                "Sign Up"
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}
            </span>{" "}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-neon hover:underline"
            >
              {isRegistering ? "Log In" : "Sign Up"}
            </button>
          </div>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="mx-4 text-xs text-muted-foreground uppercase">Or continue with</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
