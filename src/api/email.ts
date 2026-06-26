import emailjs from '@emailjs/browser';

// Inisialisasi EmailJS dengan Public Key
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '');

interface VisitorInfo {
  userAgent: string;
  screenSize: string;
  referrer: string;
  timestamp: string;
  url: string;
}

/**
 * Kirim notifikasi ke email Anda ketika seseorang membuka halaman.
 * @param toEmail - Alamat email tujuan (Anda)
 * @param visitor - Informasi pengunjung
 */
export async function sendVisitNotification(toEmail: string, visitor: VisitorInfo) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  if (!serviceId || !templateId) {
    console.warn('⚠️ EmailJS tidak dikonfigurasi. Periksa environment variables.');
    return;
  }

  const templateParams = {
    to_email: toEmail,
    user_agent: visitor.userAgent,
    screen_size: visitor.screenSize,
    referrer: visitor.referrer,
    timestamp: visitor.timestamp,
    url: visitor.url,
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams);
    console.log('✅ Notifikasi email terkirim!', response);
    return response;
  } catch (error) {
    console.error('❌ Gagal mengirim notifikasi email:', error);
    throw error;
  }
}
