export const companyMapUrl = "https://maps.app.goo.gl/P1YyVHoCdGBd9ef37";

export function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}
