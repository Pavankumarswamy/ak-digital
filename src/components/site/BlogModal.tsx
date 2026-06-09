import { Modal } from "./Modal";
import { formatDistanceToNow } from "date-fns";

export function BlogModal({
  blog,
  onClose,
}: {
  blog: any | null;
  onClose: () => void;
}) {
  if (!blog) return null;

  return (
    <Modal open onClose={onClose} title={blog.title}>
      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
        {blog.imageUrl ? (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${blog.grad || "from-[oklch(0.55_0.22_230)] to-[oklch(0.45_0.2_270)]"}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,white_1px,transparent_1px)] [background-size:14px_14px] opacity-20" />
          </div>
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          {blog.tag && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-border">
              {blog.tag}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="text-xl font-bold leading-tight sm:text-2xl">{blog.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground/80">
            {blog.createdAt ? `Published ${formatDistanceToNow(new Date(blog.createdAt))} ago` : "Recently published"}
          </p>
        </div>
        
        <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-foreground/90 whitespace-pre-wrap">
          {blog.content || blog.excerpt}
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-border flex justify-end">
        <button 
          onClick={onClose} 
          className="btn-ghost-neon !py-2 !px-4 text-sm"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
