import emailjs from '@emailjs/browser';

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '');

export interface VisitorInfo {
  visitorEmail: string;    // 🔥 ini yang ditambahkan
  userAgent: string;
  screenSize: string;
  referrer: string;
  timestamp: string;
  url: string;
  latitude?: number;
  longitude?: number;
}

export async function sendVisitNotification(toEmail: string, visitor: VisitorInfo) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  if (!serviceId || !templateId) {
    console.warn('EmailJS tidak dikonfigurasi');
    return;
  }

  const templateParams = {
    to_email: toEmail,
    visitor_email: visitor.visitorEmail,   // 🔥 ini yang ditambahkan
    user_agent: visitor.userAgent,
    screen_size: visitor.screenSize,
    referrer: visitor.referrer,
    timestamp: visitor.timestamp,
    url: visitor.url,
    latitude: visitor.latitude !== undefined ? String(visitor.latitude) : 'Tidak diketahui',
    longitude: visitor.longitude !== undefined ? String(visitor.longitude) : 'Tidak diketahui',
    location: visitor.latitude && visitor.longitude
      ? `https://www.google.com/maps?q=${visitor.latitude},${visitor.longitude}`
      : 'Tidak diketahui',
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams);
    console.log('✅ Email terkirim', response);
    return response;
  } catch (error) {
    console.error('❌ Gagal kirim email', error);
    throw error;
  }
}
