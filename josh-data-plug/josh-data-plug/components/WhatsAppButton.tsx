import { WHATSAPP_LINK } from "@/lib/constants";

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_LINK()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with JOSH DATA PLUG on WhatsApp"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-lg ring-2 ring-white transition hover:scale-105 hover:bg-accent-600 md:bottom-6"
    >
      <span aria-hidden>💬</span>
    </a>
  );
}
