/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { SpecialistType } from '../types';
import { sendSpecialistMessage } from '../services/geminiService';
import { ArrowLeftIcon, SparklesIcon, StethoscopeIcon, AppleIcon, BrainIcon, ChevronRightIcon } from './icons';

interface SpecialistChatProps {
  onBack: () => void;
  initialSpecialist?: SpecialistType | null;
}

const SpecialistChat: React.FC<SpecialistChatProps> = ({ onBack, initialSpecialist }) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistType | null>(initialSpecialist || null);
  // Fix: Correctly initialize messages as an array of chat message objects
  const [messages, setMessages] = useState<{role: string, parts: {text: string}[]}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedSpecialist || isLoading) return;

    const userMsg = inputText;
    setInputText('');
    setIsLoading(true);

    const newHistory = [...messages, { role: 'user', parts: [{ text: userMsg }] }];
    setMessages(newHistory); // Update with user message immediately

    try {
      const responseStream = sendSpecialistMessage(userMsg, messages, selectedSpecialist);
      let modelResponseText = '';
      const modelMessageIndex = newHistory.length; // Index for the new model message

      // Initialize the model's message in history for streaming
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'model', parts: [{ text: '' }] },
      ]);

      for await (const chunk of responseStream) {
        modelResponseText += chunk;
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          if (updatedMessages[modelMessageIndex]) {
            updatedMessages[modelMessageIndex].parts[0].text = modelResponseText;
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages, 
        { role: 'model', parts: [{ text: 'Desculpe, tive um problema ao processar. Pode tentar novamente?' }] }
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom(); // Scroll to bottom after response is fully streamed
    }
  };

  // Specialist Selection View
  if (!selectedSpecialist) {
    const specialists = [
      { type: SpecialistType.PEDIATRICIAN, icon: <StethoscopeIcon className="w-6 h-6 text-white" />, color: 'bg-blue-400', desc: 'Saúde, sintomas e vacinas' },
      { type: SpecialistType.PSYCHOLOGIST, icon: <BrainIcon className="w-6 h-6 text-white" />, color: 'bg-purple-400', desc: 'Apoio emocional e ansiedade' },
      { type: SpecialistType.NUTRITIONIST, icon: <AppleIcon className="w-6 h-6 text-white" />, color: 'bg-green-400', desc: 'Introdução alimentar e dietas' },
    ];

    return (
      <div className="flex flex-col h-full min-h-[calc(100vh-theme(spacing.20))] bg-[#f8f9fa]"> {/* min-h adjustment */}
        <div className="p-4 space-y-6 flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-6">Com quem você quer falar?</h2>
          <div className="space-y-4">
            {specialists.map((s) => (
              <button
                key={s.type}
                onClick={() => setSelectedSpecialist(s.type)}
                className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]"
              >
                <div className={`${s.color} p-4 rounded-full shadow-md`}>
                  {s.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-lg text-gray-800">{s.type}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
                <ChevronRightIcon className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-theme(spacing.20))] relative bg-[#f8f9fa]"> {/* min-h adjustment */}
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm z-10 sticky top-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeftIcon className="text-gray-600 w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg text-gray-800">{selectedSpecialist} IA</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-12">
                <p>Olá! Sou sua {selectedSpecialist} virtual.</p>
                <p>Como posso ajudar hoje?</p>
            </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.parts[0].text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                    <SparklesIcon className="w-5 h-5 text-primary animate-spin" />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="absolute bottom-20 left-4 right-4">
        <div className="relative flex items-center shadow-lg rounded-full bg-white">
            <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite sua dúvida..."
            className="w-full py-4 pl-6 pr-12 rounded-full focus:outline-none bg-transparent text-gray-700"
            />
            <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 p-2 bg-primary rounded-full text-white disabled:opacity-50 hover:bg-pink-500 transition-colors"
            >
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
      </form>
    </div>
  );
};

export default SpecialistChat;