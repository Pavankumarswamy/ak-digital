import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Search, CheckCircle2, CircleDashed, Loader2, Package, MessageSquare, FileText, Download } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { generateAndDownloadReceipt } from "@/lib/receipt";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Track Application — AK Digital Hub" },
      { name: "description", content: "Track your application status" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const searchParams = Route.useSearch();
  const [trackingId, setTrackingId] = useState(searchParams.id || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = trackingId.trim();
    if (!id) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const snapshot = await get(ref(db, `user_submissions/${id}`));
      if (snapshot.exists()) {
        setResult({ id, ...snapshot.val() });
      } else {
        setError("Invalid Tracking ID. No application found.");
      }
    } catch (err) {
      setError("An error occurred while tracking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.id) {
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    }
  }, [searchParams.id]);

  const forceDownload = async (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    try {
      if (url.includes('cloudinary.com') && !url.includes('fl_attachment')) {
        const parts = url.split('/upload/');
        if (parts.length === 2) {
          const downloadUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
          window.location.href = downloadUrl;
          return;
        }
      }
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const filename = url.split('/').pop()?.split('?')[0] || 'document';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background py-24 md:py-32 relative overflow-hidden">
      <div className="floating-orb h-72 w-72 bg-[oklch(0.55_0.22_230)] -top-10 -left-10" />
      <div className="floating-orb h-96 w-96 bg-[oklch(0.5_0.22_280)] bottom-0 -right-10" style={{ animationDelay: "-6s" }} />

      <div className="mx-auto w-[90%] md:w-[80%] max-w-6xl relative z-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        
        <div className="glass p-8 md:p-12 rounded-2xl neon-border text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-[oklch(0.85_0.18_210/0.1)] flex items-center justify-center mb-6 border border-[oklch(0.85_0.18_210/0.2)]">
            <Package className="h-8 w-8 text-neon" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-3">Track Application Status</h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Enter the unique tracking ID provided during your application submission to check real-time progress.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-md mx-auto relative flex items-center mb-8">
            <input
              type="text"
              required
              placeholder="e.g. 12345"
              className="w-full rounded-full border border-white/10 bg-input/50 pl-6 pr-32 py-3.5 text-sm outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:bg-input transition-all backdrop-blur-md"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !trackingId.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-[oklch(0.85_0.18_210/0.15)] hover:bg-[oklch(0.85_0.18_210/0.25)] text-neon px-6 rounded-full text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 border border-[oklch(0.85_0.18_210/0.3)] shadow-[0_0_15px_oklch(0.85_0.18_210/0.15)]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Track
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fade-up">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 text-left animate-fade-up border-t border-white/10 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{result.service}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted on {new Date(result.createdAt).toLocaleDateString()} at {new Date(result.createdAt).toLocaleTimeString()}
                  </p>
                  <button 
                    onClick={() => generateAndDownloadReceipt({
                      trackingId: result.id,
                      serviceName: result.service,
                      amount: result.data?.Amount ? Number(result.data.Amount) : 0,
                      customerName: result.data?.Name || result.data?.['Full Name'] || result.data?.['Applicant Name'] || "Customer",
                      date: new Date(result.createdAt).toLocaleDateString()
                    })}
                    className="mt-3 text-xs font-semibold text-neon flex items-center gap-1.5 hover:underline"
                  >
                    <Download className="h-4 w-4" /> Download Receipt
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Status</div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                    result.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
                    result.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                  }`}>
                    {result.status || 'Pending'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Side: Progress */}
                <div className="relative py-4">
                  {/* Connecting Line */}
                  <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-white/5"></div>
                  
                  <div className="space-y-8">
                    <StatusStep 
                      title="Application Submitted" 
                      desc="We have successfully received your application details."
                      active={true}
                      completed={true}
                    />
                    <StatusStep 
                      title="Processing Application" 
                      desc="Our experts are currently processing your request with the respective authorities."
                      active={result.status === 'Processing' || result.status === 'Completed'}
                      completed={result.status === 'Completed'}
                      current={result.status === 'Processing'}
                    />
                    <StatusStep 
                      title="Completed & Delivered" 
                      desc="Your service request has been successfully completed. Check your WhatsApp/Email."
                      active={result.status === 'Completed'}
                      completed={result.status === 'Completed'}
                      current={result.status === 'Completed'}
                    />
                  </div>
                </div>
                
                {/* Right Side: Admin Updates & Submitted Data */}
                <div className="flex flex-col gap-10">
                  {/* Top: Updates */}
                  {(result.adminMessage || result.attachedMedia) && (
                    <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                      <h4 className="text-sm font-semibold text-neon flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Updates from Admin
                      </h4>
                      
                      {result.adminMessage && (
                        <div className="bg-[oklch(0.85_0.18_210/0.05)] border border-[oklch(0.85_0.18_210/0.2)] rounded-xl p-4 relative">
                          <div className="absolute top-0 left-0 w-1 h-full bg-neon rounded-l-xl"></div>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pl-2">{result.adminMessage}</p>
                        </div>
                      )}

                      {result.attachedMedia && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Attached Document</p>
                          {result.attachedMedia.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i) ? (
                            <a href={result.attachedMedia} onClick={(e) => forceDownload(e, result.attachedMedia)} className="block w-full max-w-sm overflow-hidden rounded-lg border border-white/10 hover:border-neon transition-colors group cursor-pointer">
                              <img src={result.attachedMedia} alt="Admin Attachment" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" />
                            </a>
                          ) : (
                            <a href={result.attachedMedia} onClick={(e) => forceDownload(e, result.attachedMedia)} className="inline-flex items-center gap-2 text-sm font-medium text-neon hover:underline bg-[oklch(0.85_0.18_210/0.1)] px-4 py-2.5 rounded-lg border border-[oklch(0.85_0.18_210/0.3)] hover:bg-[oklch(0.85_0.18_210/0.2)] transition-all hover:shadow-[0_0_15px_oklch(0.85_0.18_210/0.2)] cursor-pointer">
                              <FileText className="h-4 w-4" /> Download Document
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom: Submitted Data */}
                  <div>
                    <h4 className="text-sm font-semibold text-neon flex items-center gap-2 mb-6">
                      <FileText className="h-4 w-4" /> Submitted Details
                    </h4>
                  {result.data ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 grid gap-5 sm:grid-cols-2">
                      {Object.entries(result.data).map(([k, v]) => {
                        const isUrl = typeof v === 'string' && v.startsWith('http');
                        const isImage = isUrl && /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(v as string);
                        
                        return (
                          <div key={k} className="flex flex-col gap-1.5 bg-black/20 p-3 rounded-lg border border-white/5">
                            <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider truncate">{k}</span>
                            {isUrl ? (
                              <div className="flex flex-col gap-2 mt-1">
                                {isImage && (
                                  <a href={v as string} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-white/10 w-full cursor-pointer">
                                    <img src={v as string} alt={k} className="h-24 w-full object-cover hover:scale-105 transition-transform duration-300" />
                                  </a>
                                )}
                                <a href={v as string} onClick={(e) => forceDownload(e, v as string)} className="text-xs text-neon hover:text-white transition-colors flex items-center gap-1">
                                  <Download className="h-3 w-3" /> Download Document
                                </a>
                              </div>
                            ) : (
                              <span className="text-sm text-white font-medium whitespace-pre-wrap">{v as React.ReactNode}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-white/50 p-6 bg-white/5 rounded-xl border border-white/10 text-center flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 mb-2 opacity-20" />
                      No details available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusStep({ title, desc, active, completed, current = false }: { title: string, desc: string, active: boolean, completed: boolean, current?: boolean }) {
  return (
    <div className={`relative flex items-start gap-5 transition-all ${active ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-background ${
        completed ? 'bg-[oklch(0.85_0.18_210)] shadow-[0_0_20px_oklch(0.85_0.18_210/0.4)]' : 
        current ? 'bg-[oklch(0.85_0.18_210/0.2)] border-[oklch(0.85_0.18_210/0.5)]' : 
        'bg-white/5'
      }`}>
        {completed ? (
          <CheckCircle2 className="h-6 w-6 text-background" />
        ) : current ? (
          <Loader2 className="h-6 w-6 text-neon animate-spin" />
        ) : (
          <CircleDashed className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="pt-2.5">
        <h4 className={`text-sm font-bold ${current ? 'text-neon' : 'text-foreground'}`}>{title}</h4>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
