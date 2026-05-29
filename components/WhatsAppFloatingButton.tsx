import { MessageCircle } from "lucide-react";

const whatsappMessageUrl = "https://wa.me/message/FROFUJEVUZDOC1";

export function WhatsAppFloatingButton() {
  return (
    <a
      href={whatsappMessageUrl}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact COWIN MAGNET on WhatsApp"
    >
      <span className="whatsapp-float-ring" aria-hidden />
      <MessageCircle size={30} strokeWidth={2.4} aria-hidden />
    </a>
  );
}
