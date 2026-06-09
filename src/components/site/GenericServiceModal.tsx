import { useState, useMemo } from "react";
import { Loader2, Send } from "lucide-react";
import { Modal } from "./Modal";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { openCashfreeCheckout } from "@/lib/cashfree";
import { auth, db } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { buildWhatsAppLink, generateUniqueTrackingId } from "@/lib/services";
import { generateAndDownloadReceipt } from "@/lib/receipt";

export function GenericServiceModal({
  service,
  onClose,
}: {
  service: any | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [phoneCodes, setPhoneCodes] = useState<Record<string, string>>({});
  const [selectedBullet, setSelectedBullet] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const activeConfig = useMemo(() => {
    if (!service) return { customFields: [], price: 0 };
    if (selectedBullet && service.bulletConfigs?.[selectedBullet]) {
      return {
        customFields: service.bulletConfigs[selectedBullet].customFields || [],
        price: service.bulletConfigs[selectedBullet].price !== undefined ? service.bulletConfigs[selectedBullet].price : (service.price || 0)
      };
    }
    return {
      customFields: service.customFields || [],
      price: service.price || 0
    };
  }, [service, selectedBullet]);

  const fields = activeConfig.customFields?.length > 0 ? activeConfig.customFields : [
    { id: "fullName", label: "Full Name", type: "text", required: true },
    { id: "mobile", label: "Mobile Number", type: "text", required: true },
    { id: "email", label: "Email", type: "text", required: false },
    { id: "city", label: "City", type: "text", required: true },
  ];

  if (!service) return null;

  const update = (k: string, v: string) =>
    setData((p) => ({ ...p, [k]: v }));

  const updateFile = (k: string, f: File | null) =>
    setFiles((p) => ({ ...p, [k]: f }));

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileChange = (f: any, file: File | null) => {
    if (!file) {
      updateFile(f.label, null);
      setErrors(p => ({ ...p, [f.id]: "" }));
      return;
    }

    // Validate size
    const maxSizeMB = f.imageMaxSizeMB || 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrors(p => ({ ...p, [f.id]: `File size exceeds limit of ${maxSizeMB}MB` }));
      updateFile(f.label, null);
      return;
    }

    // Validate type
    const allowed = f.imageAllowedExtensions || [".jpg", ".jpeg", ".png", ".pdf"];
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(extension)) {
      setErrors(p => ({ ...p, [f.id]: `Invalid file type. Allowed formats: ${allowed.join(", ")}` }));
      updateFile(f.label, null);
      return;
    }

    setErrors(p => ({ ...p, [f.id]: "" }));
    updateFile(f.label, file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Enforce validations
    for (const f of fields) {
      if (f.type === 'label') continue;
      
      const val = data[f.label] || "";
      const isRequired = f.required;

      if (isRequired && !val.trim() && f.type !== 'image') {
        newErrors[f.id] = `${f.label} is required`;
        continue;
      }

      if (f.type === 'email' && val.trim()) {
        if (!validateEmail(val)) {
          newErrors[f.id] = "Please enter a valid email address";
        }
      }

      if (f.type === 'phone' && val.trim()) {
        const phoneCode = phoneCodes[f.id] || f.phoneDefaultCountry || "+91";
        const digitsOnly = val.replace(/\D/g, "");

        if (phoneCode === "+91" && digitsOnly.length !== 10) {
          newErrors[f.id] = "India mobile number must be exactly 10 digits";
        } else if (phoneCode === "+1" && digitsOnly.length !== 10) {
          newErrors[f.id] = "US number must be exactly 10 digits";
        } else if (phoneCode === "+44" && digitsOnly.length !== 10) {
          newErrors[f.id] = "UK number must be exactly 10 digits";
        } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
          newErrors[f.id] = "Phone number must be between 7 and 15 digits";
        }
      }

      if (f.type === 'image' && f.required && !files[f.label]) {
        newErrors[f.id] = `${f.label} file is required`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (service.bullets && service.bullets.length > 0 && !selectedBullet) {
      setErrors({ bullet: "Please select an option above" });
      return;
    }

    setSubmitting(true);
    
    try {
      const processSubmission = async () => {
        try {
          const finalData: Record<string, string> = {};
          
          // Combine phone codes with phone number values
          for (const f of fields) {
            if (f.type === 'label') continue;
            if (f.type === 'phone') {
              const code = phoneCodes[f.id] || f.phoneDefaultCountry || "+91";
              finalData[f.label] = `${code} ${data[f.label] || ""}`;
            } else if (f.type !== 'image') {
              finalData[f.label] = data[f.label] || "";
            }
          }
          
          // Upload any files
          for (const [key, file] of Object.entries(files)) {
            if (file) {
              const url = await uploadToCloudinary(file);
              finalData[key] = url;
            }
          }

          const trackingId = await generateUniqueTrackingId();
          await set(ref(db, `user_submissions/${trackingId}`), {
            userId: auth.currentUser?.uid || "unknown",
            userEmail: auth.currentUser?.email || "unknown",
            service: service.title,
            selectedOption: selectedBullet || null,
            data: finalData,
            status: "Pending",
            createdAt: new Date().toISOString(),
          });

          const lines = Object.entries(finalData)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");
          
          let msg = `Hello AK DIGITAL HUB,\n\nI need ${service.title}.\n`;
          if (selectedBullet) msg += `Selected Option: ${selectedBullet}\n`;
          msg += `My Tracking ID is: ${trackingId}\n\n${lines}\n\nPlease assist me.`;

          generateAndDownloadReceipt({
            trackingId,
            serviceName: service.title,
            amount: activeConfig.price || 0,
            customerName: data["Full Name"] || data["Name"] || "Customer",
            date: new Date().toLocaleDateString()
          });

          alert(`Application submitted successfully!\nYour Tracking ID is: ${trackingId}\nPlease keep it safe.`);
          setData({});
          setFiles({});
          setPhoneCodes({});
          setErrors({});
          onClose();
        } catch (err) {
          alert("Failed to submit form. Please try again.");
        } finally {
          setSubmitting(false);
        }
      };

      if (activeConfig.price > 0) {
        // We need customer details for prefill if available
        const customerName = data["Full Name"] || data["Name"] || "";
        const customerEmail = data["Email"] || data["Email Address"] || "";
        const customerPhone = data["Mobile Number"] || data["Phone Number"] || "";

        await openCashfreeCheckout({
          amountInRupees: activeConfig.price, // Cashfree uses exact INR
          name: "AK DIGITAL HUB",
          description: `Payment for ${service.title}`,
          customerName,
          customerEmail,
          customerPhone,
          onSuccess: (res) => {
            // Payment success
            processSubmission();
          },
          onError: (err) => {
            alert("Payment failed or was cancelled.");
            setSubmitting(false);
          },
          onClose: () => {
            setSubmitting(false);
          }
        });
      } else {
        await processSubmission();
      }

    } catch (err) {
      alert("An error occurred during submission.");
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Apply — ${service.title}`}>
      <div className="mb-6 h-32 w-full overflow-hidden rounded-xl border border-border shadow-sm">
        <img
          src={service.imageUrl}
          alt={service.title}
          className="h-full w-full object-cover"
        />
      </div>

      {service.bullets && service.bullets.length > 0 && (
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium text-black">
            Please select the specific service you need <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBullet}
            onChange={(e) => {
              setSelectedBullet(e.target.value);
              if (errors.bullet) setErrors(p => ({ ...p, bullet: "" }));
            }}
            className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
          >
            <option value="" disabled>Select an option...</option>
            {service.bullets.map((bullet: string, idx: number) => (
              <option key={idx} value={bullet}>{bullet}</option>
            ))}
          </select>
          {errors.bullet && (
            <p className="mt-1 text-xs text-destructive">{errors.bullet}</p>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        {fields.map((f: any) => {
          const isFull = f.width === 'full' || (!f.width && (f.type === 'textarea' || f.type === 'label' || f.type === 'image'));
          const colSpan = isFull ? "sm:col-span-2" : "";

          const renderError = () => errors[f.id] && (
            <p className="mt-1 text-xs text-destructive">{errors[f.id]}</p>
          );

          if (f.type === 'label') {
            return (
              <div key={f.id} className={`${colSpan} rounded-lg bg-slate-100 p-3 border border-slate-200`}>
                <p className="text-sm text-black font-medium">{f.label}</p>
              </div>
            );
          }
          
          if (f.type === 'image') {
            return (
              <div key={f.id} className={colSpan}>
                <label className="mb-1.5 block text-xs font-medium text-black">
                  {f.label}{f.required && " *"}
                </label>
                <input
                  type="file"
                  accept={f.imageAllowedExtensions ? f.imageAllowedExtensions.join(",") : "image/*"}
                  required={f.required}
                  onChange={(e) => handleFileChange(f, e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                />
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 px-1">
                  <span>Max size: {f.imageMaxSizeMB || 5}MB</span>
                  {f.imageAllowedExtensions && (
                    <span>Allowed: {f.imageAllowedExtensions.join(", ")}</span>
                  )}
                </div>
                {renderError()}
              </div>
            );
          }

          if (f.type === 'phone') {
            const selectedCode = phoneCodes[f.id] || f.phoneDefaultCountry || "+91";
            return (
              <div key={f.id} className={colSpan}>
                <label className="mb-1.5 block text-xs font-medium text-black">
                  {f.label}{f.required && " *"}
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCode}
                    onChange={(e) => setPhoneCodes(p => ({ ...p, [f.id]: e.target.value }))}
                    className="rounded-lg border border-blue-500 bg-white px-2 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+966">🇸🇦 +966</option>
                  </select>
                  <input
                    type="tel"
                    required={f.required}
                    placeholder={f.placeholder || "Enter phone number"}
                    value={data[f.label] || ""}
                    onChange={(e) => {
                      update(f.label, e.target.value);
                      if (errors[f.id]) setErrors(p => ({ ...p, [f.id]: "" }));
                    }}
                    className="flex-1 rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                  />
                </div>
                {renderError()}
              </div>
            );
          }

          if (f.type === 'email') {
            return (
              <div key={f.id} className={colSpan}>
                <label className="mb-1.5 block text-xs font-medium text-black">
                  {f.label}{f.required && " *"}
                </label>
                <input
                  type="email"
                  required={f.required}
                  placeholder={f.placeholder || "name@example.com"}
                  value={data[f.label] || ""}
                  onChange={(e) => {
                    update(f.label, e.target.value);
                    if (errors[f.id]) setErrors(p => ({ ...p, [f.id]: "" }));
                  }}
                  className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                />
                {renderError()}
              </div>
            );
          }

          if (f.type === 'textarea') {
            return (
              <div key={f.id} className={colSpan}>
                <label className="mb-1.5 block text-xs font-medium text-black">
                  {f.label}{f.required && " *"}
                </label>
                <textarea
                  rows={3}
                  placeholder={f.placeholder || "Enter details..."}
                  required={f.required}
                  value={data[f.label] || ""}
                  onChange={(e) => {
                    update(f.label, e.target.value);
                    if (errors[f.id]) setErrors(p => ({ ...p, [f.id]: "" }));
                  }}
                  className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                />
                {renderError()}
              </div>
            );
          }

          if (f.type === 'number') {
            return (
              <div key={f.id} className={colSpan}>
                <label className="mb-1.5 block text-xs font-medium text-black">
                  {f.label}{f.required && " *"}
                </label>
                <input
                  type="number"
                  placeholder={f.placeholder || "Enter number..."}
                  required={f.required}
                  value={data[f.label] || ""}
                  onChange={(e) => {
                    update(f.label, e.target.value);
                    if (errors[f.id]) setErrors(p => ({ ...p, [f.id]: "" }));
                  }}
                  className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                />
                {renderError()}
              </div>
            );
          }

          if (f.type === 'date') {
            return (
              <div key={f.id} className={colSpan}>
                <label className="mb-1.5 block text-xs font-medium text-black">
                  {f.label}{f.required && " *"}
                </label>
                <input
                  type="date"
                  required={f.required}
                  value={data[f.label] || ""}
                  onChange={(e) => {
                    update(f.label, e.target.value);
                    if (errors[f.id]) setErrors(p => ({ ...p, [f.id]: "" }));
                  }}
                  className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                />
                {renderError()}
              </div>
            );
          }

          return (
            <div key={f.id} className={colSpan}>
              <label className="mb-1.5 block text-xs font-medium text-black">
                {f.label}{f.required && " *"}
              </label>
              <input
                type="text"
                placeholder={f.placeholder || "Enter text..."}
                required={f.required}
                value={data[f.label] || ""}
                onChange={(e) => {
                  update(f.label, e.target.value);
                  if (errors[f.id]) setErrors(p => ({ ...p, [f.id]: "" }));
                }}
                className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
              />
              {renderError()}
            </div>
          );
        })}

        {!activeConfig.customFields?.length && (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-black">
              Tell us more
            </label>
            <textarea
              rows={3}
              value={data.notes || ""}
              onChange={(e) => update("notes", e.target.value)}
              className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end mt-2 items-center gap-4">
          {activeConfig.price > 0 && (
            <div className="text-sm font-semibold gradient-text">
              Amount Payable: ₹{activeConfig.price}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-neon disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                Submit Application <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
