const WHATSAPP_API_URL = "https://graph.facebook.com/v19.0";

interface WhatsAppTextMessage {
  to: string;
  text: string;
}

interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: object[];
}

async function sendRequest(endpoint: string, body: object) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(err)}`);
  }
  return res.json();
}

export async function sendTextMessage({ to, text }: WhatsAppTextMessage) {
  const phone = to.replace(/\D/g, "");
  const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;

  return sendRequest("messages", {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedPhone,
    type: "text",
    text: { preview_url: false, body: text },
  });
}

export async function sendTemplateMessage({
  to,
  templateName,
  languageCode = "en",
  components = [],
}: WhatsAppTemplateMessage) {
  const phone = to.replace(/\D/g, "");
  const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;

  return sendRequest("messages", {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}

export async function notifyGarageNewBooking(params: {
  garageWhatsApp: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  vehicleName: string;
  serviceName: string;
  address: string;
  date: string;
  time: string;
  estimatedPrice: number;
  bookingLink: string;
}) {
  const message = `🔧 *New Service Request — Mechiee*

📋 Booking *${params.bookingNumber}*
👤 Customer: ${params.customerName}
📱 Phone: ${formatPhone(params.customerPhone)}
🚲 Vehicle: ${params.vehicleName}
🔧 Service: ${params.serviceName}
📍 Address: ${params.address}
📅 Date: ${params.date} at ${params.time}
💰 Estimated: ₹${params.estimatedPrice}

👉 View & Accept: ${params.bookingLink}

_Mechiee — Doorstep Bike Service_`;

  return sendTextMessage({ to: params.garageWhatsApp, text: message });
}

export async function notifyCustomerBookingAccepted(params: {
  customerPhone: string;
  bookingNumber: string;
  garageName: string;
  mechanicName: string;
  date: string;
  time: string;
  trackingLink: string;
}) {
  const message = `✅ *Booking Confirmed — Mechiee*

Your booking *${params.bookingNumber}* has been accepted!

🏪 Garage: ${params.garageName}
👨‍🔧 Mechanic: ${params.mechanicName}
📅 ${params.date} at ${params.time}

👉 Track live: ${params.trackingLink}

_Mechiee — Doorstep Bike Service_`;

  return sendTextMessage({ to: params.customerPhone, text: message });
}

export async function notifyCustomerServiceComplete(params: {
  customerPhone: string;
  bookingNumber: string;
  garageName: string;
  finalPrice: number;
  reviewLink: string;
}) {
  const message = `🎉 *Service Complete — Mechiee*

Your bike service (Booking *${params.bookingNumber}*) is done!

🏪 By: ${params.garageName}
💰 Amount: ₹${params.finalPrice}

⭐ Rate your experience: ${params.reviewLink}

Thank you for choosing Mechiee!`;

  return sendTextMessage({ to: params.customerPhone, text: message });
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const local = digits.slice(-10);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return phone;
}
