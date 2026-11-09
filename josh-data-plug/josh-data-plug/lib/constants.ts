export const BRAND = {
  name: "JOSH DATA PLUG",
  tagline: "Cheap Data. Instant Delivery. Trusted Plug.",
  address: "Jos, Plateau State, Nigeria",
  phones: [
    { display: "0803 194 0875", wa: "2348031940875" },
    { display: "0812 367 0163", wa: "2348123670163" },
  ],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const WHATSAPP_LINK = (message = "Hello JOSH DATA PLUG, I need help.") =>
  `https://wa.me/${BRAND.phones[0].wa}?text=${encodeURIComponent(message)}`;

export const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"] as const;
export type Network = (typeof NETWORKS)[number];

export type Service = "data" | "airtime" | "cable" | "electricity" | "exam";

export const BILL_PROVIDERS: Record<Exclude<Service, "data" | "airtime">, string[]> = {
  cable: ["DSTV", "GOtv", "StarTimes"],
  electricity: ["Ikeja Electric", "Eko Electric", "Abuja Electric", "Jos Electric (JED)", "Ibadan Electric"],
  exam: ["WAEC", "NECO", "JAMB"],
};

export const CATEGORIES = [
  { label: "MTN Data", href: "/data?network=MTN", emoji: "🟡" },
  { label: "Airtel Data", href: "/data?network=Airtel", emoji: "🔴" },
  { label: "Glo Data", href: "/data?network=Glo", emoji: "🟢" },
  { label: "9mobile Data", href: "/data?network=9mobile", emoji: "🟩" },
  { label: "Airtime", href: "/airtime", emoji: "📞" },
  { label: "Cable TV", href: "/bills?type=cable", emoji: "📺" },
  { label: "Electricity", href: "/bills?type=electricity", emoji: "💡" },
  { label: "Exam Pins", href: "/bills?type=exam", emoji: "🎓" },
] as const;

export const MIN_AMOUNT = 50;
export const MAX_AMOUNT = 100000;
export const MIN_FUNDING = 100;
