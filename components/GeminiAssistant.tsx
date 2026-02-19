
import React, { useState, useRef, useEffect } from 'react';
import { askBusinessAssistant } from '../services/gemini';
import { Language } from '../App';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface AssistantProps {
  language: Language;
}

export const GeminiAssistant: React.FC<AssistantProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const greetings = {
    en: 'Hello! I am your Gabriel Strategic Assistant. How can I help you optimize your business operations today?',
    es: '¡Hola! Soy su Asistente Estratégico de Gabriel. ¿Cómo puedo ayudarle a optimizar sus operaciones comerciales hoy?'
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: greetings[language] }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'assistant', text: greetings[language] }]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    const response = await askBusinessAssistant(`${userMessage} (Response in ${language === 'en' ? 'English' : 'Spanish'})`);
    setMessages(prev => [...prev, { role: 'assistant', text: response || (language === 'en' ? "I'm sorry, I couldn't process that." : "Lo siento, no pude procesar eso.") }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      {isOpen ? (
        <div className="w-[380px] h-[440px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in-up">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.53 4.47a1 1 0 10-1.414 1.414 3 3 0 004.242 0 1 1 0 00-1.414-1.414 1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold">Gabriel AI {language === 'es' ? 'Soporte' : 'Support'}</h4>
                <div className="flex items-center text-xs text-purple-100">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {language === 'en' ? 'Active Strategy Assistant' : 'Asistente de Estrategia Activo'}
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-purple-600 text-white shadow-md rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start items-center space-x-2 p-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={language === 'en' ? "Ask about our services..." : "Pregunte sobre nuestros servicios..."}
              className="flex-grow bg-gray-100 dark:bg-gray-700 dark:text-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-600 transition-all"
            />
            <button 
              onClick={handleSend}
              className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
};
