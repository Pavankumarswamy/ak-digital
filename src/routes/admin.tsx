import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  LogOut,
  LayoutDashboard,
  Inbox,
  MessageSquare,
  Loader2,
  Trash2,
  Lock,
  Zap,
  ArrowLeft,
  Edit2,
  Plus,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Menu,
  X,
  Send,
  Image,
  FileText,
  Star,
  Sparkles,
  IndianRupee,
} from "lucide-react";
import {
  getSubmissions,
  getContacts,
  deleteSubmission,
  type Submission,
  type ContactMessage,
  loginAdmin,
  isAdminAuthed,
  logoutAdmin,
} from "@/lib/storage";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { ref, push, update, remove, onValue } from "firebase/database";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { services as staticServices } from "@/lib/services";
import { staticBlogs } from "@/components/site/Blogs";
import { Modal } from "@/components/site/Modal";
import { AIFormBuilder } from "@/components/admin/AIAssistant";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — AK Digital Hub" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthed(isAdminAuthed());
    setLoading(false);
  }, []);

  if (loading) return null;
  
  if (!authed) {
    return <LoginView onLoginSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={() => { logoutAdmin(); setAuthed(false); }} />;
}

function LoginView({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const success = loginAdmin(email, password);
      if (!success) {
        throw new Error("Invalid admin credentials.");
      }
      onLoginSuccess();
    } catch (error: any) {
      setErr(error.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="floating-orb h-72 w-72 bg-[oklch(0.55_0.22_230)] -top-10 -left-10" />
      <div className="floating-orb h-96 w-96 bg-[oklch(0.5_0.22_280)] bottom-0 -right-10" style={{ animationDelay: "-6s" }} />

      <div className="relative mx-auto grid min-h-screen max-w-md place-items-center px-4">
        <div className="w-full">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-neon">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>

          <div className="glass rounded-2xl p-8 neon-border">
            <div className="mb-6 flex items-center gap-3">
              <img 
                src="https://i.ibb.co/n8r45Wn4/ffdedfa4-9854-4edf-a2a6-bd14dab999c2.jpg" 
                alt="AK Digital Hub Logo" 
                className="h-11 w-11 rounded-full object-cover border border-[oklch(0.85_0.18_210/0.3)] shadow-[0_0_20px_oklch(0.85_0.18_210/0.5)]" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=AK";
                }}
              />
              <div>
                <h1 className="text-lg font-bold gradient-text">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">AK Digital Hub</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-input px-3 py-2.5 text-sm outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
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
                  className="w-full rounded-lg border border-white/10 bg-input px-3 py-2.5 text-sm outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                />
              </div>
              {err && (
                <p className="text-xs text-destructive">{err}</p>
              )}
              <button type="submit" disabled={loading} className="btn-neon !py-2 w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Sign In
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground/80">Admin access only</p>
              <p className="mt-1">Login with authorized admin credentials.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const getDefaultCustomFields = () => [
  { id: "def-fullname", type: 'text' as const, label: 'Full Name', required: true, width: 'half' as const },
  { id: "def-mobile", type: 'text' as const, label: 'Mobile Number', required: true, width: 'half' as const },
  { id: "def-email", type: 'text' as const, label: 'Email', required: false, width: 'half' as const },
  { id: "def-city", type: 'text' as const, label: 'City', required: true, width: 'half' as const }
];

function ManageServices() {
  const [loading, setLoading] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  
  // Selected service for AI + form builder workspace
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedBullet, setSelectedBullet] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [customFields, setCustomFields] = useState<any[]>(getDefaultCustomFields());
  const [savingFields, setSavingFields] = useState(false);

  // "Add/Edit Details" dialog state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingDetailsId, setEditingDetailsId] = useState<string | null>(null);
  const defaultDetailsForm = { title: "", description: "", iconName: "Briefcase", whatsappTopic: "", bullets: "", existingImage: "", serviceId: "", price: 0 };
  const [detailsForm, setDetailsForm] = useState(defaultDetailsForm);
  const [detailsFile, setDetailsFile] = useState<File | null>(null);

  // Field config modal
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [modalField, setModalField] = useState<any>({
    id: "", type: "text", label: "", placeholder: "", required: false, width: "half",
    phoneDefaultCountry: "+91", imageMaxSizeMB: 5, imageAllowedExtensions: [".jpg", ".jpeg", ".png", ".pdf"],
  });

  useEffect(() => {
    const servicesRef = ref(db, 'services');
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setServicesList(list);
        // keep selected service in sync
        if (selectedService) {
          const updated = list.find(s => s.id === selectedService.id);
          if (updated) {
            setSelectedService(updated);
            if (selectedBullet) {
              const config = updated.bulletConfigs?.[selectedBullet] || { customFields: getDefaultCustomFields(), price: updated.price || 0 };
              setCustomFields((config.customFields && config.customFields.length > 0) ? config.customFields : getDefaultCustomFields());
              setCurrentPrice(config.price);
            } else {
              setCustomFields((updated.customFields && updated.customFields.length > 0) ? updated.customFields : getDefaultCustomFields());
              setCurrentPrice(updated.price || 0);
            }
          }
        }
      } else {
        setServicesList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSelectCard = (s: any) => {
    setSelectedService(s);
    setSelectedBullet(null);
    setCustomFields((s.customFields && s.customFields.length > 0) ? s.customFields : getDefaultCustomFields());
    setCurrentPrice(s.price || 0);
  };

  const handleSelectBullet = (b: string | null) => {
    setSelectedBullet(b);
    if (b && selectedService) {
      const config = selectedService.bulletConfigs?.[b] || { customFields: getDefaultCustomFields(), price: selectedService.price || 0 };
      setCustomFields((config.customFields && config.customFields.length > 0) ? config.customFields : getDefaultCustomFields());
      setCurrentPrice(config.price);
    } else if (selectedService) {
      setCustomFields((selectedService.customFields && selectedService.customFields.length > 0) ? selectedService.customFields : getDefaultCustomFields());
      setCurrentPrice(selectedService.price || 0);
    }
  };

  // ── Details Modal ────────────────────────────────────────────────
  const openAddDetails = () => {
    setEditingDetailsId(null);
    setDetailsForm(defaultDetailsForm);
    setDetailsFile(null);
    setIsDetailsModalOpen(true);
  };

  const openEditDetails = (s: any) => {
    setEditingDetailsId(s.id);
    setDetailsForm({
      title: s.title || "", description: s.description || "", iconName: s.iconName || "Briefcase",
      whatsappTopic: s.whatsappTopic || "", bullets: Array.isArray(s.bullets) ? s.bullets.join("\n") : "",
      existingImage: s.imageUrl || "", serviceId: s.serviceId || "", price: s.price || 0,
    });
    setDetailsFile(null);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDetailsId && !detailsFile) return alert("Please select an image for the new service.");
    setLoading(true);
    try {
      let imageUrl = detailsForm.existingImage;
      if (detailsFile) imageUrl = await uploadToCloudinary(detailsFile);
      const data = {
        title: detailsForm.title, description: detailsForm.description, iconName: detailsForm.iconName,
        whatsappTopic: detailsForm.whatsappTopic, bullets: detailsForm.bullets.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean),
        imageUrl, serviceId: detailsForm.serviceId || null, price: Number(detailsForm.price) || 0,
        customFields: editingDetailsId
          ? (servicesList.find(s => s.id === editingDetailsId)?.customFields || getDefaultCustomFields())
          : getDefaultCustomFields(),
      };
      if (editingDetailsId) {
        await update(ref(db, `services/${editingDetailsId}`), data);
      } else {
        await push(ref(db, 'services'), data);
      }
      setIsDetailsModalOpen(false);
    } catch (err: any) { alert(err.message || "Failed."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await remove(ref(db, `services/${id}`));
      if (selectedService?.id === id) setSelectedService(null);
    } catch { alert("Failed to delete."); }
  };

  // ── Save Form Layout ──────────────────────────────────────────────
  const saveFormLayout = async () => {
    if (!selectedService) return;
    setSavingFields(true);
    try {
      if (selectedBullet) {
        await update(ref(db, `services/${selectedService.id}/bulletConfigs/${selectedBullet}`), { customFields, price: currentPrice });
      } else {
        await update(ref(db, `services/${selectedService.id}`), { customFields, price: currentPrice });
      }
      alert("Form layout saved!");
    } catch (err: any) { alert(err.message); }
    finally { setSavingFields(false); }
  };

  // ── Field Modal ───────────────────────────────────────────────────
  const openAddField = () => {
    setModalField({ id: Math.random().toString(36).slice(2), type: "text", label: "", placeholder: "", required: false, width: "half", phoneDefaultCountry: "+91", imageMaxSizeMB: 5, imageAllowedExtensions: [".jpg", ".jpeg", ".png", ".pdf"] });
    setEditingField(null);
    setIsFieldModalOpen(true);
  };

  const openEditField = (field: any) => {
    setModalField({ id: field.id, type: field.type || "text", label: field.label || "", placeholder: field.placeholder || "", required: !!field.required, width: field.width || "half", phoneDefaultCountry: field.phoneDefaultCountry || "+91", imageMaxSizeMB: field.imageMaxSizeMB || 5, imageAllowedExtensions: field.imageAllowedExtensions || [".jpg", ".jpeg", ".png", ".pdf"] });
    setEditingField(field);
    setIsFieldModalOpen(true);
  };

  const saveModalField = () => {
    if (!modalField.label.trim()) { alert("Please enter a field label"); return; }
    setCustomFields(prev => {
      const exists = prev.some(f => f.id === modalField.id);
      return exists ? prev.map(f => f.id === modalField.id ? modalField : f) : [...prev, modalField];
    });
    setIsFieldModalOpen(false);
  };

  const removeField = (id: string) => setCustomFields(prev => prev.filter(f => f.id !== id));
  const moveField = (index: number, direction: 'up' | 'down') => {
    setCustomFields(prev => {
      const arr = [...prev];
      if (direction === 'up' && index > 0) [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      else if (direction === 'down' && index < arr.length - 1) [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      return arr;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnd = () => setDraggedIndex(null);
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setCustomFields(prev => {
      const arr = [...prev];
      const [item] = arr.splice(draggedIndex, 1);
      arr.splice(targetIndex, 0, item);
      return arr;
    });
    setDraggedIndex(null);
  };

  const handleSeed = async () => {
    if (!confirm("Seed all old static services to Firebase?")) return;
    setLoading(true);
    try {
      for (const s of staticServices) {
        const { id, icon, ...rest } = s;
        const iconName = id === 'employment' ? 'Briefcase' : id === 'pan' ? 'CreditCard' : id === 'shop' ? 'Store' : id === 'gst' ? 'Receipt' : id === 'credit' ? 'Banknote' : id === 'voter' ? 'Vote' : 'Briefcase';
        await push(ref(db, 'services'), { ...rest, serviceId: id, iconName, price: s.price || 0, customFields: [] });
      }
      alert("Seeded!");
    } catch (e: any) { alert("Failed: " + e.message); }
    setLoading(false);
  };

  const typeLabels: Record<string, string> = { text: 'Text Box', textarea: 'Text Area', number: 'Number', date: 'Date', phone: 'Phone', email: 'Email', image: 'Image', label: 'Label' };

  return (
    <div className="space-y-6">
      {/* ── Service Cards Grid ── */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold">Services</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Click a card to open the AI Form Builder for that service.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSeed} disabled={loading} className="btn-ghost-neon !py-2 !px-3 text-xs">Seed Static</button>
            <button onClick={openAddDetails} className="btn-neon !py-2 !px-4 text-sm flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Add Service
            </button>
          </div>
        </div>

        {servicesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">No services yet. Add one above.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {servicesList.map(s => {
              const isSelected = selectedService?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectCard(s)}
                  className={`group relative rounded-2xl border-2 p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20 ring-2 ring-primary/30'
                      : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md'
                  }`}
                >
                  {/* Selected badge */}
                  {isSelected && (
                    <div className="absolute -top-2.5 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow">
                      Editing
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className={`h-14 w-14 rounded-xl object-cover border-2 transition-all ${isSelected ? 'border-primary shadow-md shadow-primary/20' : 'border-border'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm truncate ${isSelected ? 'text-neon' : 'text-white'}`}>{s.title}</h4>
                      <p className="text-xs text-white/70 truncate mt-0.5">{s.description}</p>
                      <p className="text-xs font-semibold text-neon/80 mt-1">
                        {s.price ? `₹${s.price}` : 'Free'} · {(s.customFields?.length || 0)} fields
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={e => { e.stopPropagation(); openEditDetails(s); }}
                      className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Details
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
                      className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs text-white/70 hover:text-destructive hover:bg-destructive/10 border border-white/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── AI Form Builder Workspace (only when a card is selected) ── */}
      {selectedService ? (
        <div className="glass rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl shadow-primary/10 animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-primary/5 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <img src={selectedService.imageUrl} alt={selectedService.title} className="h-9 w-9 rounded-lg object-cover border-2 border-primary/50" />
              <div>
                <h3 className="font-bold text-base">{selectedService.title}</h3>
                <p className="text-xs text-white/70">AI Form Builder — customise the contact form fields for this service</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedService.bullets && selectedService.bullets.length > 0 && (
                <select
                  value={selectedBullet || ""}
                  onChange={(e) => handleSelectBullet(e.target.value || null)}
                  className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white outline-none"
                >
                  <option value="">Default Form & Price</option>
                  {selectedService.bullets.map((b: string) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              )}
              <div className="flex items-center gap-2 border border-white/10 rounded-lg px-2 py-1 bg-black/20">
                <span className="text-xs text-white/70">₹</span>
                <input
                  type="number"
                  min="0"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                  className="w-16 bg-transparent text-sm text-white outline-none"
                  placeholder="Price"
                />
              </div>
              <button onClick={() => setCustomFields(getDefaultCustomFields())} className="text-xs text-white/70 hover:text-white border border-white/10 px-3 py-2 rounded-lg transition-colors">
                Reset Defaults
              </button>
              <button onClick={saveFormLayout} disabled={savingFields} className="btn-neon !py-2 !px-5 text-sm flex items-center gap-2">
                {savingFields ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Form Layout
              </button>
              <button onClick={() => setSelectedService(null)} className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Two-column workspace */}
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* LEFT — AI Chat */}
            <div className="flex flex-col h-[620px]">
              <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-neon" />
                <span className="text-sm font-semibold">AI Assistant</span>
                <span className="ml-auto text-xs text-white/70 bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/10">GPT-OSS 120B</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <AIFormBuilder
                  form={{ title: selectedService.title + (selectedBullet ? ` - ${selectedBullet}` : ''), customFields }}
                  setForm={(updater: any) => {
                    if (typeof updater === 'function') {
                      setCustomFields(updater({ customFields }).customFields);
                    } else {
                      setCustomFields(updater.customFields);
                    }
                  }}
                />
              </div>
            </div>

            {/* RIGHT — Dynamic Form Preview + Manual Editor */}
            <div className="flex flex-col h-[620px]">
              <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-neon" />
                  <span className="text-sm font-semibold">Form Fields</span>
                  <span className="text-xs text-white/60">({customFields.length} fields)</span>
                </div>
                <button onClick={openAddField} className="flex items-center gap-1.5 text-xs btn-ghost-neon !py-2 !px-2.5">
                  <Plus className="h-3.5 w-3.5" /> Add Field
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {customFields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/50">
                    <Sparkles className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm text-center text-white/70">Ask the AI to generate fields,<br/>or click "Add Field" manually.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {customFields.map((field, idx) => {
                      const isFull = field.width === 'full' || (!field.width && (field.type === 'textarea' || field.type === 'label' || field.type === 'image'));
                      return (
                        <div
                          key={field.id}
                          draggable
                          onDragStart={e => handleDragStart(e, idx)}
                          onDragOver={handleDragOver}
                          onDragEnd={handleDragEnd}
                          onDrop={e => handleDrop(e, idx)}
                          onClick={() => openEditField(field)}
                          className={`relative rounded-xl border-2 p-3 pl-8 pr-14 cursor-pointer transition-all hover:border-primary/40 hover:bg-primary/5 select-none ${isFull ? 'sm:col-span-2' : ''} ${draggedIndex === idx ? 'opacity-30 border-primary/60' : 'border-border bg-muted/30'}`}
                        >
                          {/* Drag handle */}
                          <div className="absolute top-1/2 -translate-y-1/2 left-2 text-white/40 cursor-grab hover:text-neon transition-colors" onClick={e => e.stopPropagation()}>
                            <GripVertical className="h-4 w-4" />
                          </div>

                          {/* Controls */}
                          <div className="absolute top-2 right-2 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => moveField(idx, 'up')} disabled={idx === 0} className="p-1 text-white/60 hover:text-neon disabled:opacity-20 transition-colors"><ArrowUp className="h-3 w-3" /></button>
                            <button onClick={() => moveField(idx, 'down')} disabled={idx === customFields.length - 1} className="p-1 text-white/60 hover:text-neon disabled:opacity-20 transition-colors"><ArrowDown className="h-3 w-3" /></button>
                            <button onClick={() => removeField(field.id)} className="p-1 text-white/60 hover:text-destructive transition-colors"><Trash2 className="h-3 w-3" /></button>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-[9px] uppercase font-bold tracking-wider rounded-full bg-white/10 text-white px-2 py-0.5 border border-white/20">
                              {typeLabels[field.type] || field.type}
                            </span>
                            {field.required && <span className="text-[9px] uppercase font-bold tracking-wider rounded-full bg-destructive/10 text-destructive px-2 py-0.5 border border-destructive/20">Required</span>}
                            <span className="text-[9px] uppercase font-semibold text-white/70 bg-white/10 border border-white/10 px-1.5 py-0.5 rounded-full">{field.width === 'full' ? 'Full' : 'Half'}</span>
                          </div>
                          <p className="text-xs font-semibold text-white/90 truncate">{field.label || <span className="italic text-white/40">Untitled Field</span>}</p>
                          {field.placeholder && <p className="text-[10px] text-white/60 mt-0.5 truncate">Placeholder: {field.placeholder}</p>}
                        </div>
                      );
                    })}

                    <button
                      onClick={openAddField}
                      className="border-2 border-dashed border-white/10 hover:border-neon/50 bg-transparent hover:bg-white/5 rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer sm:col-span-2"
                    >
                      <div className="h-8 w-8 rounded-full bg-white/10 group-hover:bg-white/15 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-white/70" />
                      </div>
                      <span className="text-xs text-white/70">Add Field Manually</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state — no service selected */
        <div className="glass rounded-2xl border-2 border-dashed border-border p-12 flex flex-col items-center justify-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a Service to Edit its Form</h3>
          <p className="text-sm text-muted-foreground max-w-sm">Click any service card above to open the AI-powered form builder. You can chat with the AI to add or modify form fields, or edit them manually.</p>
        </div>
      )}

      {/* ── Add/Edit Details Modal ── */}
      <Modal open={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={editingDetailsId ? "Edit Service Details" : "Add New Service"}>
        <form onSubmit={handleDetailsSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Service Title</label>
              <input required className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" value={detailsForm.title} onChange={e => setDetailsForm({...detailsForm, title: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Price (₹) — 0 for free</label>
              <input type="number" min="0" required className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" value={detailsForm.price} onChange={e => setDetailsForm({...detailsForm, price: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Icon</label>
              <select className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm focus:border-primary outline-none text-foreground" value={detailsForm.iconName} onChange={e => setDetailsForm({...detailsForm, iconName: e.target.value})}>
                {["Briefcase","CreditCard","Store","Receipt","Banknote","Vote","Activity","FileText","Zap"].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Description</label>
              <textarea required rows={2} className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" value={detailsForm.description} onChange={e => setDetailsForm({...detailsForm, description: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">WhatsApp Topic</label>
              <input required className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" value={detailsForm.whatsappTopic} onChange={e => setDetailsForm({...detailsForm, whatsappTopic: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Bullet Points (one per line)</label>
              <textarea required rows={4} className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm focus:border-primary outline-none resize-y" value={detailsForm.bullets} onChange={e => setDetailsForm({...detailsForm, bullets: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Service Image</label>
              <div className="flex gap-3 items-center">
                {editingDetailsId && detailsForm.existingImage && !detailsFile && (
                  <img src={detailsForm.existingImage} alt="Current" className="h-12 w-12 rounded-lg object-cover border-2 border-border" />
                )}
                <input required={!editingDetailsId} type="file" accept="image/*" className="flex-1 border border-border bg-input rounded-lg px-3 py-2 text-sm outline-none" onChange={e => setDetailsFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border flex justify-end gap-3">
            <button type="button" onClick={() => setIsDetailsModalOpen(false)} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 border border-border text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="btn-neon !py-2 !px-6 text-sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : null}
              {editingDetailsId ? "Update Service" : "Add Service"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Add/Edit Field Modal ── */}
      <Modal open={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)} title={editingField ? "Edit Field" : "Add Field"}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Field Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[['text','Text'],['textarea','Textarea'],['number','Number'],['date','Date'],['phone','Phone'],['email','Email'],['image','Image'],['label','Label']].map(([v, lbl]) => (
                <button key={v} type="button"
                  onClick={() => setModalField((p: any) => ({ ...p, type: v, width: (v === 'textarea' || v === 'label' || v === 'image') ? 'full' : p.width }))}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-all text-center ${modalField.type === v ? 'bg-primary/15 text-primary border-primary/50 shadow-sm' : 'border-border hover:border-primary/30 bg-muted text-muted-foreground hover:text-foreground'}`}
                >{lbl}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">{modalField.type === 'label' ? 'Label Text' : 'Field Label'}</label>
            <input type="text" placeholder="e.g. Full Name" className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm focus:border-primary outline-none text-foreground" value={modalField.label} onChange={e => setModalField((p: any) => ({ ...p, label: e.target.value }))} />
          </div>
          {modalField.type !== 'label' && modalField.type !== 'image' && modalField.type !== 'date' && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Placeholder</label>
              <input type="text" placeholder="e.g. Enter your name" className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm focus:border-primary outline-none text-foreground" value={modalField.placeholder} onChange={e => setModalField((p: any) => ({ ...p, placeholder: e.target.value }))} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Width</label>
              <select className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm focus:border-primary outline-none text-foreground" value={modalField.width} onChange={e => setModalField((p: any) => ({ ...p, width: e.target.value }))}>
                <option value="half">Half Width</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            {modalField.type !== 'label' && (
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                  <input type="checkbox" checked={modalField.required} onChange={e => setModalField((p: any) => ({ ...p, required: e.target.checked }))} className="rounded border-border h-4 w-4 accent-primary" />
                  Required field
                </label>
              </div>
            )}
          </div>
          {modalField.type === 'phone' && (
            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
              <label className="text-xs font-semibold text-primary block mb-2">Default Country Code</label>
              <select className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm outline-none text-foreground" value={modalField.phoneDefaultCountry} onChange={e => setModalField((p: any) => ({ ...p, phoneDefaultCountry: e.target.value }))}>
                <option value="+91">🇮🇳 India (+91)</option>
                <option value="+1">🇺🇸 USA (+1)</option>
                <option value="+44">🇬🇧 UK (+44)</option>
                <option value="+971">🇦🇪 UAE (+971)</option>
              </select>
            </div>
          )}
          {modalField.type === 'image' && (
            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <label className="text-xs font-semibold text-primary block">Image Settings</label>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max File Size</label>
                <select className="w-full border border-border bg-input rounded-lg px-3 py-2 text-sm outline-none text-foreground" value={modalField.imageMaxSizeMB} onChange={e => setModalField((p: any) => ({ ...p, imageMaxSizeMB: parseInt(e.target.value) }))}>
                  {[1,2,5,10,20].map(v => <option key={v} value={v}>{v} MB</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Allowed Types</label>
                <div className="flex flex-wrap gap-3">
                  {['.jpg','.jpeg','.png','.pdf','.gif'].map(ext => (
                    <label key={ext} className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={(modalField.imageAllowedExtensions||[]).includes(ext)} onChange={e => { const exts = e.target.checked ? [...(modalField.imageAllowedExtensions||[]),ext] : (modalField.imageAllowedExtensions||[]).filter((x: string) => x !== ext); setModalField((p: any) => ({ ...p, imageAllowedExtensions: exts })); }} className="rounded accent-primary" />{ext}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="pt-3 border-t border-border flex justify-end gap-3">
            <button type="button" onClick={() => setIsFieldModalOpen(false)} className="px-4 py-2 rounded-lg bg-muted border border-border text-xs font-semibold transition-colors">Cancel</button>
            <button type="button" onClick={saveModalField} className="btn-neon !py-2 !px-4 text-xs">{editingField ? "Update Field" : "Add Field"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ManageBlogs() {
  const [loading, setLoading] = useState(false);
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultForm = { 
    title: "", 
    excerpt: "", 
    tag: "", 
    content: "", 
    existingImage: "",
    grad: "from-[oklch(0.55_0.22_230)] to-[oklch(0.45_0.2_270)]"
  };
  const [form, setForm] = useState(defaultForm);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBlogsList(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setBlogsList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (blog: any) => {
    setEditingId(blog.id);
    setForm({
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      tag: blog.tag || "",
      content: blog.content || "",
      existingImage: blog.imageUrl || "",
      grad: blog.grad || defaultForm.grad,
    });
    setFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(defaultForm);
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await remove(ref(db, `blogs/${id}`));
    } catch (error) {
      alert("Failed to delete blog.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = form.existingImage;
      if (file) {
        imageUrl = await uploadToCloudinary(file);
      }

      const blogData = {
        title: form.title,
        excerpt: form.excerpt,
        tag: form.tag,
        content: form.content,
        imageUrl,
        grad: form.grad,
        createdAt: new Date().toISOString(),
      };

      if (editingId) {
        // Keep original createdAt
        const existingBlog = blogsList.find(b => b.id === editingId);
        if (existingBlog && existingBlog.createdAt) {
          blogData.createdAt = existingBlog.createdAt;
        }
        await update(ref(db, `blogs/${editingId}`), blogData);
        alert("Blog updated successfully!");
      } else {
        await push(ref(db, 'blogs'), blogData);
        alert("Blog added successfully!");
      }
      handleCancelEdit();
    } catch (error: any) {
      alert(error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm("Are you sure you want to push all old static blogs to Firebase? This might duplicate existing ones.")) return;
    setLoading(true);
    try {
      for (const b of staticBlogs) {
        const blogData = {
          title: b.title,
          excerpt: b.excerpt,
          tag: b.tag,
          content: b.excerpt, // fallback content
          imageUrl: "",
          grad: b.grad,
          createdAt: new Date().toISOString(),
        };
        await push(ref(db, 'blogs'), blogData);
      }
      alert("Old blogs pushed to Firebase successfully!");
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{editingId ? "Edit Blog" : "Add New Blog"}</h3>
          {editingId && (
            <button onClick={handleCancelEdit} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Cancel Edit & Add New
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2 w-full mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Title</label>
              <input required className="w-full border border-white/10 bg-input rounded-lg px-3 py-2 text-sm focus:border-[oklch(0.85_0.18_210/0.6)] outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tag (e.g. PAN, GST)</label>
              <input className="w-full border border-white/10 bg-input rounded-lg px-3 py-2 text-sm focus:border-[oklch(0.85_0.18_210/0.6)] outline-none" value={form.tag} onChange={e => setForm({...form, tag: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Excerpt (Short Summary)</label>
              <textarea required rows={2} className="w-full border border-white/10 bg-input rounded-lg px-3 py-2 text-sm focus:border-[oklch(0.85_0.18_210/0.6)] outline-none" value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Image (Cloudinary Upload)</label>
              <div className="flex gap-4 items-center">
                {editingId && form.existingImage && !file && (
                  <img src={form.existingImage} alt="Current" className="h-10 w-10 rounded object-cover border border-white/10" />
                )}
                <input type="file" accept="image/*" className="w-full border border-white/10 bg-input rounded-lg px-3 py-2 text-sm focus:border-[oklch(0.85_0.18_210/0.6)] outline-none" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 md:border-l md:border-white/10 md:pl-6">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Full Content</label>
              <textarea required rows={8} className="w-full border border-white/10 bg-input rounded-lg px-3 py-2 text-sm focus:border-[oklch(0.85_0.18_210/0.6)] outline-none whitespace-pre-wrap" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Write your blog post content here..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Gradient Theme (Fallback if no image)</label>
              <select className="w-full border border-white/10 bg-input rounded-lg px-3 py-2 text-sm focus:border-[oklch(0.85_0.18_210/0.6)] outline-none text-foreground" value={form.grad} onChange={e => setForm({...form, grad: e.target.value})}>
                <option value="from-[oklch(0.55_0.22_230)] to-[oklch(0.45_0.2_270)]">Neon Blue</option>
                <option value="from-[oklch(0.6_0.2_205)] to-[oklch(0.45_0.2_240)]">Cyber Cyan</option>
                <option value="from-[oklch(0.5_0.22_280)] to-[oklch(0.4_0.18_220)]">Deep Purple</option>
                <option value="from-[oklch(0.65_0.18_200)] to-[oklch(0.5_0.22_250)]">Teal Glow</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2 pt-4 border-t border-white/10">
            <button type="submit" disabled={loading} className="btn-neon !py-2 w-full">
              {loading ? "Saving..." : (editingId ? "Update Blog" : "Add Blog")}
            </button>
          </div>
        </form>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Existing Blogs</h3>
          <button onClick={handleSeed} disabled={loading} className="btn-ghost-neon !py-2 !px-3 text-xs">
            Seed Old Static Blogs
          </button>
        </div>
        {blogsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blogs found in database.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogsList.map(b => (
              <div key={b.id} className="border border-white/10 bg-white/5 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.title} className="h-12 w-12 rounded object-cover border border-white/10" />
                  ) : (
                    <div className={`h-12 w-12 rounded bg-gradient-to-br ${b.grad} border border-white/10`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{b.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{b.tag}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-auto pt-2 border-t border-white/10">
                  <button onClick={() => handleEdit(b)} className="p-1.5 text-muted-foreground hover:text-neon rounded bg-white/5 hover:bg-white/10">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded bg-white/5 hover:bg-white/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ManageTestimonials() {
  const [loading, setLoading] = useState(false);
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultForm = { name: "", role: "", text: "" };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    const refs = ref(db, 'testimonials');
    const unsubscribe = onValue(refs, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTestimonialsList(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setTestimonialsList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setForm({ name: t.name || "", role: t.role || "", text: t.text || "" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await remove(ref(db, `testimonials/${id}`));
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const initials = form.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "C";
      const payload = {
        name: form.name,
        role: form.role,
        text: form.text,
        initials
      };

      if (editingId) {
        await update(ref(db, `testimonials/${editingId}`), payload);
      } else {
        await push(ref(db, 'testimonials'), payload);
      }
      handleCancelEdit();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{editingId ? "Edit Testimonial" : "Add New Testimonial"}</h3>
          {editingId && (
            <button onClick={handleCancelEdit} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Cancel Edit & Add New
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2 w-full mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Client Name</label>
              <input required className="w-full border border-white/10 bg-input rounded-lg px-3 py-2 text-sm focus:border-[oklch(0.85_0.18_210/0.6)] outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Role/Designation</label>
              <input required className="w-full border border-white/10 bg-input rounded-lg px-3 py-2 text-sm focus:border-[oklch(0.85_0.18_210/0.6)] outline-none" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
            </div>
          </div>
          <div className="space-y-4 md:border-l md:border-white/10 md:pl-6">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Review Text</label>
              <textarea required rows={4} className="w-full border border-white/10 bg-input rounded-lg px-3 py-2 text-sm focus:border-[oklch(0.85_0.18_210/0.6)] outline-none" value={form.text} onChange={e => setForm({...form, text: e.target.value})} />
            </div>
          </div>
          <div className="md:col-span-2 pt-4 border-t border-white/10">
            <button type="submit" disabled={loading} className="btn-neon !py-2 w-full">
              {loading ? "Saving..." : (editingId ? "Update Testimonial" : "Add Testimonial")}
            </button>
          </div>
        </form>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Existing Testimonials</h3>
        {testimonialsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No testimonials found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonialsList.map(t => (
              <div key={t.id} className="border border-white/10 bg-white/5 rounded-xl p-4 flex flex-col gap-3">
                <div>
                  <h4 className="font-semibold text-sm">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                  <p className="mt-2 text-xs text-foreground/80 italic">"{t.text}"</p>
                </div>
                <div className="flex justify-end gap-2 mt-auto pt-2 border-t border-white/10">
                  <button onClick={() => handleEdit(t)} className="p-1.5 text-muted-foreground hover:text-neon rounded bg-white/5 hover:bg-white/10">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded bg-white/5 hover:bg-white/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilePreviewModal({ url, onClose }: { url: string | null; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  
  // Reset scale when url changes
  useEffect(() => {
    if (url) setScale(1);
  }, [url]);
  
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="relative w-full h-full md:w-[60vw] md:h-[60vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <button onClick={() => setScale(s => s + 0.2)} className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-bold text-xs flex items-center transition-colors shadow-sm">
              Zoom In +
            </button>
            <button onClick={() => setScale(s => Math.max(0.2, s - 0.2))} className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-bold text-xs flex items-center transition-colors shadow-sm">
              Zoom Out -
            </button>
            <button onClick={() => setScale(1)} className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-bold text-xs flex items-center transition-colors shadow-sm">
              Reset
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100/50 p-4 relative">
          <img 
            src={url} 
            alt="Preview" 
            style={{ transform: `scale(${scale})`, transition: 'transform 0.2s ease-out', transformOrigin: 'center' }} 
            className="max-w-full max-h-full object-contain shadow-sm bg-white" 
          />
        </div>
      </div>
    </div>
  );
}



function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"overview" | "submissions" | "contacts" | "services" | "blogs" | "testimonials" | "settlements">("overview");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [servicesCount, setServicesCount] = useState(0);
  const [testimonialsCount, setTestimonialsCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uploadingMediaId, setUploadingMediaId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  const [blogsCount, setBlogsCount] = useState(0);

  useEffect(() => {
    const subsRef = ref(db, 'user_submissions');
    const unsubscribe = onValue(subsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSubs(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse());
      } else {
        setSubs([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshContacts = () => {
    setContacts(getContacts());
  };
  useEffect(refreshContacts, []);

  useEffect(() => {
    const servicesRef = ref(db, 'services');
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setServicesCount(Object.keys(data).length);
      } else {
        setServicesCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBlogsCount(Object.keys(data).length);
      } else {
        setBlogsCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const tRef = ref(db, 'testimonials');
    const unsubscribe = onValue(tRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTestimonialsCount(Object.keys(data).length);
      } else {
        setTestimonialsCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "submissions", label: `Applications (${subs.length})`, icon: Inbox },
    { id: "contacts", label: `Messages (${contacts.length})`, icon: MessageSquare },
    { id: "services", label: "Manage Services", icon: Zap },
    { id: "blogs", label: "Manage Blogs", icon: FileText },
    { id: "testimonials", label: "Manage Reviews", icon: Star },
  ];

  const groupedSubs = useMemo(() => {
    return subs.reduce((acc, curr) => {
      const serviceName = curr.service || "Other";
      if (!acc[serviceName]) acc[serviceName] = [];
      acc[serviceName].push(curr);
      return acc;
    }, {} as Record<string, any[]>);
  }, [subs]);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-blue flex flex-col h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Header/Logo area in sidebar */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="https://i.ibb.co/n8r45Wn4/ffdedfa4-9854-4edf-a2a6-bd14dab999c2.jpg" 
              alt="AK Digital Hub Logo" 
              className="h-9 w-9 rounded-full object-cover border border-[oklch(0.85_0.18_210/0.3)]" 
            />
            <div>
              <div className="text-sm font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Admin Panel</div>
              <div className="text-[10px] uppercase tracking-wider text-blue-200/60">AK Digital Hub</div>
            </div>
          </div>
          <button className="md:hidden text-blue-200/60 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id as typeof tab);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all ${
                  active
                    ? "bg-[oklch(0.85_0.18_210/0.2)] text-white border border-[oklch(0.85_0.18_210/0.4)] font-medium shadow-[0_0_15px_oklch(0.85_0.18_210/0.15)]"
                    : "text-blue-100/60 hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-[oklch(0.85_0.18_210)]" : "text-blue-100/50"}`} /> 
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Footer/Logout in sidebar */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link to="/" className="w-full btn-ghost-neon !py-2 !px-3 text-xs justify-center flex items-center gap-2 border border-white/5 hover:border-white/10">
            View Site
          </Link>
          <button onClick={onLogout} className="w-full rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 py-2 px-3 text-xs justify-center flex items-center gap-2 font-medium transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden glass sticky top-0 z-30 border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-muted-foreground hover:text-foreground">
              <Menu className="h-6 w-6" />
            </button>
            <img 
              src="https://i.ibb.co/n8r45Wn4/ffdedfa4-9854-4edf-a2a6-bd14dab999c2.jpg" 
              alt="AK Digital Hub Logo" 
              className="h-7 w-7 rounded-full object-cover border border-[oklch(0.85_0.18_210/0.3)] ml-2" 
            />
            <div className="text-sm font-bold gradient-text ml-1">Admin Dashboard</div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full">
            {tab === "overview" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Total Applications", subs.length],
                  ["Contact Messages", contacts.length],
                  ["Active Services", servicesCount],
                  ["Blog Posts", blogsCount],
                ].map(([l, v]) => (
                  <div key={l as string} className="glass rounded-2xl p-6">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
                    <div className="mt-2 font-display text-3xl font-bold gradient-text">{v}</div>
                  </div>
                ))}
                <div className="glass rounded-2xl p-6 sm:col-span-2 lg:col-span-4 mt-2">
                  <h3 className="text-sm font-semibold">Welcome back 👋</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This is your admin panel. Manage applications, view contact messages,
                    and customize dynamic services, blogs, FAQs, and pricing plans.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <button
                      onClick={() => setTab("services")}
                      className="group rounded-xl border border-[oklch(0.85_0.18_210/0.3)] bg-[oklch(0.85_0.18_210/0.05)] px-4 py-4 text-left transition-all hover:bg-[oklch(0.85_0.18_210/0.12)] hover:border-[oklch(0.85_0.18_210/0.6)] hover:shadow-[0_0_20px_oklch(0.85_0.18_210/0.2)]"
                    >
                      <div className="text-xs font-semibold text-neon flex items-center gap-1.5 mb-2">
                        Manage Services <span className="text-[10px] rounded bg-[oklch(0.85_0.18_210/0.2)] px-1.5 py-0.5 font-bold uppercase tracking-wider text-neon ml-auto">Active ✅</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground group-hover:text-foreground/90 transition-colors leading-relaxed">
                        Add, edit, or delete dynamic services.
                      </p>
                    </button>

                    <button
                      onClick={() => setTab("services")}
                      className="group rounded-xl border border-[oklch(0.85_0.18_210/0.3)] bg-[oklch(0.85_0.18_210/0.05)] px-4 py-4 text-left transition-all hover:bg-[oklch(0.85_0.18_210/0.12)] hover:border-[oklch(0.85_0.18_210/0.6)] hover:shadow-[0_0_20px_oklch(0.85_0.18_210/0.2)]"
                    >
                      <div className="text-xs font-semibold text-neon flex items-center gap-1.5 mb-2">
                        Dynamic Form Builder <span className="text-[10px] rounded bg-[oklch(0.85_0.18_210/0.2)] px-1.5 py-0.5 font-bold uppercase tracking-wider text-neon ml-auto">Active ✅</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground group-hover:text-foreground/90 transition-colors leading-relaxed">
                        Build customized popups for each service.
                      </p>
                    </button>

                    {["Manage Blogs", "Manage FAQs", "Pricing", "Image Uploads"].map((f) => (
                      <div key={f} className="rounded-xl border border-white/5 bg-white/5 p-4 text-left opacity-70">
                        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                          🚧 {f}
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                          Coming soon to dashboard.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "submissions" && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Service Applications</h3>
                  <div className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full text-white">{subs.length} total entries</div>
                </div>
                {subs.length === 0 ? (
                  <div className="glass px-6 py-16 flex flex-col items-center justify-center text-center rounded-2xl">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Inbox className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No applications yet. <br/>Submit a service form on the homepage to see entries here.
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedSubs).map(([serviceName, groupSubs]) => (
                    <div key={serviceName} className="glass overflow-hidden rounded-2xl mb-6">
                      <div className="bg-[oklch(0.85_0.18_210/0.1)] border-b border-[oklch(0.85_0.18_210/0.2)] px-6 py-4 flex items-center justify-between">
                        <h4 className="font-semibold text-neon">{serviceName}</h4>
                        <span className="text-xs font-medium text-[oklch(0.85_0.18_210)] bg-[oklch(0.85_0.18_210/0.15)] px-2 py-1 rounded">{groupSubs.length} entries</span>
                      </div>
                      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                        {groupSubs.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSubmission(s)}
                            className={`border ${
                              s.status === 'Completed' ? 'border-green-300 bg-green-50' :
                              s.status === 'Processing' ? 'border-blue-300 bg-blue-50' :
                              'border-yellow-300 bg-yellow-50'
                            } rounded-xl p-4 text-left hover:shadow-md transition-all flex flex-col gap-2 group relative overflow-hidden`}
                          >
                            <div className="absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity bg-current"></div>
                            <div className="flex justify-between items-start w-full gap-2 pl-2">
                              <h5 className="font-semibold text-slate-900 truncate">{s.service}</h5>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-sm ${
                                s.status === 'Completed' ? 'bg-green-200 text-green-800' :
                                s.status === 'Processing' ? 'bg-blue-200 text-blue-800' :
                                'bg-yellow-200 text-yellow-800'
                              }`}>
                                {s.status || "Pending"}
                              </span>
                            </div>
                            <div className="pl-2 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 font-medium tracking-wider">
                                {new Date(s.createdAt).toLocaleString()}
                              </span>
                              {s.userEmail && (
                                <span className="text-xs text-slate-700 truncate font-medium">{s.userEmail}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "contacts" && (
              <div className="glass overflow-hidden rounded-2xl">
                <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Contact Messages</h3>
                  <div className="text-xs text-muted-foreground">{contacts.length} total messages</div>
                </div>
                {contacts.length === 0 ? (
                  <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No messages yet.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {contacts.map((c) => (
                      <li key={c.id} className="px-6 py-5 hover:bg-white/[0.02] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground mb-3 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-foreground font-medium text-[10px]">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-foreground/90 text-sm">
                              {c.name}
                            </span>
                            <span className="opacity-50 mx-1 hidden sm:inline">•</span>
                            <a href={`mailto:${c.email}`} className="hover:text-neon hover:underline">{c.email}</a>
                            {c.phone && (
                              <>
                                <span className="opacity-50 mx-1 hidden sm:inline">•</span>
                                <a href={`tel:${c.phone}`} className="hover:text-neon hover:underline">{c.phone}</a>
                              </>
                            )}
                          </div>
                          <span className="whitespace-nowrap bg-white/5 px-2 py-1 rounded text-[10px]">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5 relative">
                          <div className="absolute top-0 left-0 w-1 h-full bg-[oklch(0.85_0.18_210/0.5)] rounded-l-lg"></div>
                          <p className="text-sm text-foreground/90 leading-relaxed pl-2 whitespace-pre-wrap">{c.message}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === "services" && <ManageServices />}
            {tab === "blogs" && <ManageBlogs />}
            {tab === "testimonials" && <ManageTestimonials />}
          </div>
        </div>
      </main>
      <FilePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      
      {/* Detailed Submission Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-50 rounded-2xl w-full max-w-3xl max-h-full overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 bg-white border-b border-slate-200">
              <div className="flex flex-col gap-1 pr-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{selectedSubmission.service}</h2>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-sm ${
                    selectedSubmission.status === 'Completed' ? 'bg-green-200 text-green-800' :
                    selectedSubmission.status === 'Processing' ? 'bg-blue-200 text-blue-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {selectedSubmission.status || "Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Tracking ID: <span className="text-slate-700">{selectedSubmission.id}</span></span>
                  <span>•</span>
                  <span>{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this application?")) {
                      try {
                        await remove(ref(db, `user_submissions/${selectedSubmission.id}`));
                        alert("Application deleted successfully.");
                        setSelectedSubmission(null);
                      } catch (e) {
                        alert("Failed to delete application.");
                      }
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete Application"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button onClick={() => setSelectedSubmission(null)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6 bg-slate-50">
              
              {/* Left Column (Data) */}
              <div className="flex-1 flex flex-col gap-6">
                {selectedSubmission.selectedOption && (
                  <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 flex flex-col gap-1 shadow-sm">
                    <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Selected Option</span>
                    <span className="text-slate-900 font-semibold text-sm">{selectedSubmission.selectedOption}</span>
                  </div>
                )}
                
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Form Data</h4>
                  </div>
                  <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {Object.entries(selectedSubmission.data || {}).map(([k, v]) => {
                      const isUrl = typeof v === 'string' && v.startsWith('http');
                      const isImage = isUrl && /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(v as string);
                      
                      let downloadUrl = v as string;
                      if (isUrl && downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
                        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
                      }

                      return (
                        <div key={k} className="flex flex-col gap-1">
                          <span className="text-blue-600 uppercase text-[10px] font-bold tracking-wider truncate">{k}</span>
                          {isUrl ? (
                            <div className="flex flex-col gap-2 mt-1">
                              {isImage && (
                                <button onClick={() => setPreviewUrl(v as string)} className="block overflow-hidden rounded-md border border-slate-200 w-full cursor-pointer focus:outline-none">
                                  <img src={v as string} alt={k} className="h-24 w-full object-cover hover:scale-105 transition-transform duration-300" />
                                </button>
                              )}
                              <div className="flex gap-2">
                                <button onClick={() => setPreviewUrl(v as string)} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium flex-1 transition-colors flex items-center justify-center gap-1 shadow-sm">
                                  Open
                                </button>
                                <a href={downloadUrl} download target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex-1 transition-colors flex items-center justify-center gap-1 shadow-sm">
                                  Download
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-900 font-medium text-sm whitespace-pre-wrap leading-relaxed">{v as React.ReactNode}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column (Controls) */}
              <div className="w-full md:w-72 shrink-0 flex flex-col gap-6">
                
                {/* Actions */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Update Status</span>
                    <div className="relative">
                      <input
                        list="status-options"
                        value={selectedSubmission.status || "Pending"}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          update(ref(db, `user_submissions/${selectedSubmission.id}`), { status: newStatus });
                          setSelectedSubmission({...selectedSubmission, status: newStatus});
                        }}
                        placeholder="Type custom status..."
                        className={`text-sm font-bold px-3 py-2.5 rounded-lg border outline-none w-full shadow-sm transition-all text-center ${
                          selectedSubmission.status === 'Completed' ? 'bg-green-50 text-green-800 border-green-300' :
                          selectedSubmission.status === 'Processing' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          ['Pending', ''].includes(selectedSubmission.status || 'Pending') ? 'bg-yellow-50 text-yellow-800 border-yellow-300' :
                          'bg-purple-50 text-purple-800 border-purple-300'
                        }`}
                      />
                      <datalist id="status-options">
                        <option value="Pending" />
                        <option value="Processing" />
                        <option value="Completed" />
                      </datalist>
                    </div>
                  </div>

                  {selectedSubmission.userEmail && (
                    <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact User</span>
                      <a 
                        href={`mailto:${selectedSubmission.userEmail}?subject=${encodeURIComponent(`Update on your ${selectedSubmission.service} Application`)}`}
                        className="w-full text-sm font-bold px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Send className="h-4 w-4" /> Send Email
                      </a>
                    </div>
                  )}
                </div>

                {/* Admin Note & Media */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admin Attachments</span>
                    {selectedSubmission.attachedMedia && (
                      <div className="mb-3">
                        {selectedSubmission.attachedMedia.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i) ? (
                          <button onClick={() => setPreviewUrl(selectedSubmission.attachedMedia)} className="block overflow-hidden rounded-md border border-slate-200 w-full cursor-pointer focus:outline-none">
                            <img src={selectedSubmission.attachedMedia} alt="Attached" className="h-28 w-full object-cover hover:scale-105 transition-transform duration-300" />
                          </button>
                        ) : (
                          <a href={selectedSubmission.attachedMedia} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full text-blue-600 text-sm font-medium hover:underline bg-blue-50 p-3 rounded border border-blue-100">
                            <FileText className="h-4 w-4" /> View Document
                          </a>
                        )}
                      </div>
                    )}
                    
                    <label className={`relative flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-sm font-medium ${uploadingMediaId === selectedSubmission.id ? 'opacity-50 pointer-events-none' : 'text-slate-600 hover:text-slate-900'}`}>
                      {uploadingMediaId === selectedSubmission.id ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><Plus className="h-4 w-4" /> Attach Media</>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingMediaId(selectedSubmission.id);
                            const url = await uploadToCloudinary(file);
                            await update(ref(db, `user_submissions/${selectedSubmission.id}`), { attachedMedia: url });
                            setSelectedSubmission({...selectedSubmission, attachedMedia: url});
                          } catch (err) {
                            alert("Failed to upload media.");
                          } finally {
                            setUploadingMediaId(null);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admin Note</span>
                    <textarea
                      className="w-full text-sm p-3 rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 resize-none min-h-[100px]"
                      placeholder="Add a note/message for the customer (they will see this on the tracking page)..."
                      defaultValue={selectedSubmission.adminMessage || ""}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val !== (selectedSubmission.adminMessage || "")) {
                          update(ref(db, `user_submissions/${selectedSubmission.id}`), { adminMessage: val });
                          setSelectedSubmission({...selectedSubmission, adminMessage: val});
                        }
                      }}
                    />
                    <p className="text-[10px] text-slate-400 text-right mt-1">Auto-saves on blur</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
