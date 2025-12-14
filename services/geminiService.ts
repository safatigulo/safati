import { GoogleGenAI } from "@google/genai";
import { InvitationRequest } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client only if the key is present to avoid immediate crashes, 
// though actual calls will fail gracefully if missing.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateInvitationWording = async (data: InvitationRequest): Promise<string> => {
  if (!ai) {
    throw new Error("API Key belum dikonfigurasi.");
  }

  const prompt = `
    Bertindaklah sebagai penulis konten kreatif untuk percetakan undangan pernikahan profesional.
    Buatkan draf teks undangan pernikahan yang indah dan terstruktur dengan detail berikut:
    
    - Mempeliai Pria: ${data.groomName}
    - Mempelai Wanita: ${data.brideName}
    - Tanggal: ${data.date}
    - Lokasi: ${data.venue}
    - Gaya Bahasa: ${data.tone} (Formal/Santai/Islami/Adat Jawa)
    - Bahasa Output: ${data.language === 'id' ? 'Indonesia' : data.language === 'jw' ? 'Jawa Halus (Krama Inggil)' : 'Inggris'}
    
    Format output harus rapi, mengandung pembukaan, isi (detail acara), dan penutup yang sopan. 
    Jangan gunakan markdown bold/italic yang berlebihan, fokus pada kata-kata yang puitis namun jelas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Maaf, gagal menghasilkan teks saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Gagal menghubungi layanan AI. Silakan coba lagi nanti.");
  }
};