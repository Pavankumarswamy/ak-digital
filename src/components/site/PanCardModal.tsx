import { useState } from "react";
import { Loader2, Send, Upload, CheckCircle2 } from "lucide-react";
import { Modal } from "./Modal";
import { buildWhatsAppLink, generateUniqueTrackingId } from "@/lib/services";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";
import { openCashfreeCheckout } from "@/lib/cashfree";
import { auth, db } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { generateAndDownloadReceipt } from "@/lib/receipt";

const fields = [
  { name: "fullName", label: "Full Name", type: "text", required: true },
  { name: "fatherName", label: "Father Name", type: "text", required: true },
  { name: "dob", label: "Date of Birth", type: "date", required: true },
  { name: "mobile", label: "Mobile Number", type: "tel", required: true, pattern: "[0-9]{10}" },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "aadhaar", label: "Aadhaar Number", type: "text", required: true },
  { name: "address", label: "Address", type: "textarea", required: true },
  { name: "pincode", label: "PIN Code", type: "text", required: true, pattern: "[0-9]{6}" },
] as const;

export function PanCardModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<Record<string, string>>({});
  const [panType, setPanType] = useState("New PAN");
  const [gender, setGender] = useState("Male");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [files, setFiles] = useState<Record<string, File | null>>({
    aadhaarFile: null,
    photoFile: null,
    signatureFile: null,
  });
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  const update = (k: string, v: string) =>
    setData((p) => ({ ...p, [k]: v }));

  const handleFileChange = (key: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const processSubmission = async () => {
        try {
          const fileUrls: Record<string, string> = {};
          
          // Upload files to Cloudinary
          for (const [key, file] of Object.entries(files)) {
            if (file) {
              setUploadingFiles(prev => ({ ...prev, [key]: true }));
              try {
                const url = await uploadToCloudinary(file);
                fileUrls[key] = url;
                toast.success(`${key.replace("File", "")} uploaded successfully`);
              } catch (err) {
                toast.error(`Failed to upload ${key.replace("File", "")}`);
                throw err;
              } finally {
                setUploadingFiles(prev => ({ ...prev, [key]: false }));
              }
            }
          }

           const payload = { ...data, panType, gender, ...fileUrls };
          const trackingId = await generateUniqueTrackingId();
          await set(ref(db, `user_submissions/${trackingId}`), {
            userId: auth.currentUser?.uid || "unknown",
            userEmail: auth.currentUser?.email || "unknown",
            service: "New PAN Card",
            data: payload,
            status: "Pending",
            createdAt: new Date().toISOString(),
          });

          const msg = `Hello AK DIGITAL HUB,
    
    I need New PAN Card Service.
    My Tracking ID is: ${trackingId}
    
    Name: ${data.fullName || "-"}
    Father Name: ${data.fatherName || "-"}
    DOB: ${data.dob || "-"}
    Mobile: ${data.mobile || "-"}
    Email: ${data.email || "-"}
    Aadhaar: ${data.aadhaar || "-"}
    Address: ${data.address || "-"}
    PIN Code: ${data.pincode || "-"}
    Gender: ${gender}
    PAN Type: ${panType}
    
    Documents:
    ${fileUrls.aadhaarFile ? `- Aadhaar: ${fileUrls.aadhaarFile}` : ""}
    ${fileUrls.photoFile ? `- Photo: ${fileUrls.photoFile}` : ""}
    ${fileUrls.signatureFile ? `- Signature: ${fileUrls.signatureFile}` : ""}
    
    Please continue my application process.`;

          const PAN_CARD_PRICE = 1; // Fixed price for PAN card service
          generateAndDownloadReceipt({
            trackingId,
            serviceName: "New PAN Card",
            amount: PAN_CARD_PRICE,
            customerName: data.fullName || "Customer",
            date: new Date().toLocaleDateString()
          });

          setSuccess(true);
          setSubmitting(false);
          setTimeout(() => {
            alert(`Application submitted successfully!\nYour Tracking ID is: ${trackingId}\nPlease keep it safe.`);
            setSuccess(false);
            setData({});
            setFiles({ aadhaarFile: null, photoFile: null, signatureFile: null });
            onClose();
          }, 1500);
        } catch (error) {
          console.error(error);
          setSubmitting(false);
          toast.error("Something went wrong. Please try again.");
        }
      };

      const PAN_CARD_PRICE = 1; // Fixed price for PAN card service

      await openCashfreeCheckout({
        amountInRupees: PAN_CARD_PRICE,
        name: "AK DIGITAL HUB",
        description: "Payment for PAN Card Service",
        customerName: data.fullName || "",
        customerEmail: data.email || "",
        customerPhone: data.mobile || "",
        onSuccess: (res) => {
          processSubmission();
        },
        onError: (err) => {
          toast.error("Payment failed or was cancelled.");
          setSubmitting(false);
        },
        onClose: () => {
          setSubmitting(false);
        }
      });

    } catch (error) {
      console.error(error);
      setSubmitting(false);
      toast.error("An error occurred during submission.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New PAN Card Application">
      {success ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.85_0.18_210)] to-[oklch(0.55_0.2_265)] animate-pulse-glow">
            <Send className="h-7 w-7 text-[oklch(0.13_0.05_260)]" />
          </div>
          <h4 className="text-lg font-semibold gradient-text">Submitted!</h4>
          <p className="mt-2 text-sm text-black">
            Redirecting to WhatsApp…
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.name}
              className={f.type === "textarea" ? "sm:col-span-2" : ""}
            >
              <label className="mb-1.5 block text-xs font-medium text-black">
                {f.label}{f.required && " *"}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  required={f.required}
                  rows={2}
                  value={data[f.name] || ""}
                  onChange={(e) => update(f.name, e.target.value)}
                  className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                />
              ) : (
                <input
                  type={f.type}
                  required={f.required}
                  pattern={(f as { pattern?: string }).pattern}
                  value={data[f.name] || ""}
                  onChange={(e) => update(f.name, e.target.value)}
                  className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
                />
              )}
            </div>
          ))}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-black">
              PAN Type
            </label>
            <select
              value={panType}
              onChange={(e) => setPanType(e.target.value)}
              className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[oklch(0.85_0.18_210/0.6)] focus:ring-2 focus:ring-ring"
            >
              <option>New PAN</option>
              <option>Reprint PAN</option>
              <option>Minor PAN</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-black">
              Gender
            </label>
            <div className="flex gap-2">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                    gender === g
                      ? "border-[oklch(0.85_0.18_210/0.6)] bg-blue-50 text-[oklch(0.85_0.18_210)] font-medium"
                      : "border-slate-200 bg-white text-black hover:bg-slate-50"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {(["aadhaarFile", "photoFile", "signatureFile"] as const).map((k) => (
            <div key={k}>
              <label className="mb-1.5 block text-xs font-medium text-black capitalize">
                Upload {k.replace("File", "")}
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(k, e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-dashed border-blue-500 bg-white px-3 py-2 text-xs text-black file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[oklch(0.85_0.18_210)] hover:border-slate-400 cursor-pointer"
                />
                {files[k] && !uploadingFiles[k] && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {uploadingFiles[k] && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neon animate-spin" />
                )}
              </div>
            </div>
          ))}

          <div className="sm:col-span-2 mt-2 flex justify-end items-center gap-4">
            <div className="text-sm font-semibold gradient-text">
              Amount Payable: ₹1
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-neon disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {Object.values(uploadingFiles).some(v => v) ? "Uploading Docs..." : "Submitting..."}
                </>
              ) : (
                <>
                  Submit Application <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
