import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, MoreVertical, Sparkles } from 'lucide-react';
import { ChatMessage, User } from '../types';
import { sendMessageToGemini, startChatSession } from '../services/geminiService';
import { appointmentService } from '../services/api';

interface ChatProps {
  user: User;
}

export const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar Chat con Contexto
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      try {
        // 1. Obtener contexto real
        const appointments = await appointmentService.getByUser(user.id);
        
        // Buscar próximo turno confirmado
        const nextAppointment = appointments
          .filter(a => a.status === 'confirmed' && new Date(a.date + 'T' + a.time) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

        let contextString = '';
        if (nextAppointment) {
          const dateStr = new Date(nextAppointment.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
          contextString = `El usuario tiene un próximo turno confirmado el ${dateStr} a las ${nextAppointment.time}hs para ${nextAppointment.treatment} con ${nextAppointment.doctor}.`;
        } else {
          contextString = 'El usuario no tiene turnos confirmados próximos.';
        }

        // 2. Iniciar sesión en Gemini
        startChatSession(user.name, contextString);

        // 3. Mensaje de bienvenida personalizado
        setMessages([
          {
            id: 'init',
            role: 'model',
            text: `¡Hola ${user.name.split(' ')[0]}! 👋 Soy DentiBot. Veo que ${nextAppointment ? 'tienes un turno pronto' : 'no tienes turnos pendientes'}. ¿En qué puedo ayudarte hoy?`,
            timestamp: new Date()
          }
        ]);

      } catch (error) {
        console.error("Error initializing chat context", error);
        // Fallback
        startChatSession(user.name);
        setMessages([{
          id: 'init',
          role: 'model',
          text: `¡Hola ${user.name}! Soy DentiBot 🦷. ¿En qué puedo ayudarte hoy?`,
          timestamp: new Date()
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMsg.text);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Error chatting", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary-500 to-cyan-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 leading-tight">DentiBot</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-slate-500 font-medium">En línea</span>
            </div>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`chat-bubble ${
              msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-model'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[10px] mt-1 text-right opacity-70 ${
                msg.role === 'user' ? 'text-primary-100' : 'text-slate-400'
              }`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-slate-100 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full bg-white p-4 border-t border-slate-100 flex gap-2 items-end">
        <div className="flex-1 bg-slate-100 rounded-2xl p-2 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:bg-white focus-within:border-primary-200 border border-transparent">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu consulta..."
            className="bg-transparent w-full p-2 focus:outline-none text-slate-800 placeholder:text-slate-400 text-sm max-h-32 resize-none"
            autoComplete="off"
          />
        </div>
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className="p-3 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-600/30 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
        >
          {isLoading ? <Sparkles size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};