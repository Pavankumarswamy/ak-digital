import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { BlogModal } from "./BlogModal";

export const staticBlogs = [
  {
    title: "PAN Card Guide 2026",
    excerpt: "Everything you need to apply for a new PAN card without errors.",
    tag: "PAN",
    grad: "from-[oklch(0.55_0.22_230)] to-[oklch(0.45_0.2_270)]",
  },
  {
    title: "GST Registration Benefits",
    excerpt: "Why every shop owner should register for GST this year.",
    tag: "GST",
    grad: "from-[oklch(0.6_0.2_205)] to-[oklch(0.45_0.2_240)]",
  },
  {
    title: "Employment Registration Process",
    excerpt: "Step-by-step guide to register & renew employment cards.",
    tag: "Employment",
    grad: "from-[oklch(0.5_0.22_280)] to-[oklch(0.4_0.18_220)]",
  },
  {
    title: "Voter ID Update Guide",
    excerpt: "Quickly correct your voter ID details — online & hassle-free.",
    tag: "Voter ID",
    grad: "from-[oklch(0.65_0.18_200)] to-[oklch(0.5_0.22_250)]",
  },
];

export function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBlogs(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setBlogs(staticBlogs);
      }
    });
    return () => unsubscribe();
  }, []);

  const displayBlogs = blogs.length > 0 ? blogs : staticBlogs;

  return (
    <section id="blogs" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neon">
            Latest Insights
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            From Our <span className="gradient-text">Blog</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayBlogs.map((b, i) => (
            <article
              key={b.title}
              onClick={() => setSelectedBlog(b)}
              className="group glass overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[0_0_40px_oklch(0.85_0.18_210/0.25)] animate-fade-up cursor-pointer"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div
                className={`relative h-40 overflow-hidden ${!b.imageUrl ? `bg-gradient-to-br ${b.grad || "from-[oklch(0.55_0.22_230)] to-[oklch(0.45_0.2_270)]"}` : ''}`}
              >
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,white_1px,transparent_1px)] [background-size:14px_14px] opacity-20" />
                )}
                {b.tag && (
                  <span className="absolute left-4 top-4 rounded-full bg-muted px-3 py-1 text-xs text-white backdrop-blur-md border border-border">
                    {b.tag}
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col h-full">
                <h3 className="text-base font-semibold leading-snug">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {b.excerpt}
                </p>
                <button className="mt-4 pt-4 inline-flex items-center gap-1 text-sm font-medium text-neon transition-transform group-hover:translate-x-0.5">
                  Read More <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <BlogModal 
        blog={selectedBlog} 
        onClose={() => setSelectedBlog(null)} 
      />
    </section>
  );
}
