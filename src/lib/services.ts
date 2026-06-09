// Centralized service definitions
import {
  Briefcase,
  CreditCard,
  Store,
  Receipt,
  Banknote,
  Vote,
  type LucideIcon,
} from "lucide-react";

export interface ServiceItem {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  bullets: string[];
  whatsappTopic: string;
  imageUrl: string;
  price?: number;
}

export const services: ServiceItem[] = [
  {
    id: "employment",
    title: "Employment Services",
    icon: Briefcase,
    description: "Full registration support — new, renewal, and corrections.",
    bullets: [
      "New Registration",
      "Renewal",
      "Lapsed Renewal",
      "Correction",
      "All services done here",
    ],
    whatsappTopic: "Employment Services",
    imageUrl: "https://londontraining.on.ca/2016/img/port/banner-employment-services.jpg",
    price: 1,
  },
  {
    id: "pan",
    title: "PAN Card Services",
    icon: CreditCard,
    description: "Apply for new PAN or correct existing PAN details quickly.",
    bullets: ["New PAN Card", "PAN Correction"],
    whatsappTopic: "PAN Card Services",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ6Te-nGm40Oj8u_RoVGpKlj-5r-Ws9KUHyA&s",
    price: 1,
  },
  {
    id: "shop",
    title: "Basic Need For New Shop",
    icon: Store,
    description: "Everything you need to launch and run a new shop legally.",
    bullets: ["Shop Act License", "Trade Setup", "Compliance"],
    whatsappTopic: "New Shop Setup",
    imageUrl: "https://images-cdn.welcomesoftware.com/Zz00OGIxNzZhODc4MDYxMWVlYWUwOTkyZDkwZTA4ZjQyNQ==",
    price: 1,
  },
  {
    id: "gst",
    title: "GST Registration",
    icon: Receipt,
    description: "New GST registration for shops, traders, and businesses.",
    bullets: ["New GST", "Shops & Businesses", "Documentation"],
    whatsappTopic: "GST Registration",
    imageUrl: "https://inventiontax.com/wp-content/uploads/2024/02/GST-registration-in-Telangana.jpg",
    price: 1,
  },
  {
    id: "credit",
    title: "Credit Card to Bank Transfer",
    icon: Banknote,
    description: "Fast credit-card-to-bank-account fund transfer assistance.",
    bullets: ["Instant Process", "Secure", "Low Charges"],
    whatsappTopic: "Credit Card to Bank Transfer",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2022/10/US/BW/NU/94195747/how-to-transfer-money-from-credit-card-to-bank-account-4-png.png",
    price: 1,
  },
  {
    id: "voter",
    title: "Voter ID Services",
    icon: Vote,
    description: "New Voter ID, corrections, address change, and more.",
    bullets: ["New Voter ID", "Correction", "Address Change"],
    whatsappTopic: "Voter ID Services",
    imageUrl: "https://5.imimg.com/data5/SELLER/Default/2024/6/425865288/AL/OM/FG/105467048/voter-id-card-services.jpg",
    price: 1,
  },
];

export const WHATSAPP_NUMBER = "919363351084";
export const PHONE_NUMBER = "9363351084";

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

import { ref, get } from "firebase/database";
import { db } from "./firebase";

export async function generateUniqueTrackingId(): Promise<string> {
  let isUnique = false;
  let attempts = 0;
  let trackingId = "";

  while (!isUnique && attempts < 10) {
    const candidate = Math.floor(10000 + Math.random() * 90000).toString();
    const snapshot = await get(ref(db, `user_submissions/${candidate}`));
    if (!snapshot.exists()) {
      trackingId = candidate;
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    trackingId = Math.floor(10000 + Math.random() * 90000).toString();
  }

  return trackingId;
}
