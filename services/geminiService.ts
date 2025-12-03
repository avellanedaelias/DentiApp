import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;

// Initialize the Gemini Client
// Note: The API key is strictly accessed via process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_INSTRUCTION = `
Eres "DentiBot", el asistente virtual amable y profesional de la clínica odontológica "DentiApp".
Tu objetivo es ayudar a los pacientes con dudas sobre tratamientos dentales básicos, consejos de higiene y funcionamiento de la app.
Responde de manera concisa, empática y clara, usando un tono relajado pero profesional.

IMPORTANTE:
1. NO puedes realizar diagnósticos médicos. Si el usuario describe dolor agudo, recomiéndale reservar un turno de urgencia inmediatamente.
2. Si te preguntan por horarios, diles que pueden ver la disponibilidad en la sección de "Turnos" de la app.
3. Mantén las respuestas cortas (máximo 3 oraciones).
`;

export const startChatSession = (userName: string, contextData: string = ''): Chat => {
  const dynamicInstruction = `
    ${BASE_INSTRUCTION}
    
    INFORMACIÓN DE CONTEXTO ACTUAL:
    Estás hablando con el paciente: ${userName}.
    ${contextData ? `Datos de su agenda: ${contextData}` : 'No hay datos de turnos próximos.'}
    
    Usa esta información para personalizar tus respuestas. Por ejemplo, si tiene un turno cerca, recuérdaselo si viene al caso.
  `;

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: dynamicInstruction,
      temperature: 0.7,
    },
  });

  return chatSession;
};

export const getChatSession = (): Chat => {
  if (!chatSession) {
    // Fallback if session wasn't started with context
    return startChatSession('Usuario Invitado');
  }
  return chatSession;
  
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = getChatSession();
    const result = await chat.sendMessage({ message });
    return result.text || "Lo siento, no pude procesar tu respuesta. Intenta de nuevo.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Hubo un problema de conexión. Por favor, verifica tu internet e intenta más tarde.";
  }
};