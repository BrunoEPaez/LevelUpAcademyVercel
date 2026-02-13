import React, { useState, useRef, useEffect } from 'react';
import { Mistral } from "@mistralai/mistralai";
import ReactMarkdown from 'react-markdown';

const apiKey = import.meta.env.VITE_MISTRAL_KEY;
const client = new Mistral({ apiKey });

// Añadimos la interfaz para recibir el curso seleccionado
interface AIAssistantProps {
  selectedCourse?: any;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ selectedCourse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem('levelup_chat_history');
    return savedChat ? JSON.parse(savedChat) : [
      { role: 'assistant', content: '¡Hola! Soy LevelUp AI. ¿En qué puedo ayudarte con tus estudios hoy?' }
    ];
  });

  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('levelup_chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    const initialMessage = [{ role: 'assistant', content: '¡Hola de nuevo! He limpiado el historial. ¿Qué nueva duda tienes?' }];
    setMessages(initialMessage);
    localStorage.removeItem('levelup_chat_history');
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev: any) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // LÓGICA DE CONTEXTO: Si hay un curso seleccionado, se lo decimos a la IA en secreto
    const courseContext = selectedCourse 
      ? ` El usuario actualmente está viendo el curso: "${selectedCourse.title}". Descripción: "${selectedCourse.description}".` 
      : " El usuario no ha seleccionado ningún curso específico todavía.";

    try {
      const result = await client.chat.complete({
        model: "mistral-small-latest",
        messages: [
          { 
            role: "system", 
            // Agregamos el contexto al final del system prompt
            content: `Eres el asistente de LevelUp Academy. Eres un experto programador. Responde en español usando Markdown.${courseContext}` 
          },
          ...messages.map((m: any) => ({ role: m.role as any, content: m.content })),
          userMessage
        ],
      });

      const aiText = result.choices?.[0]?.message?.content || "Lo siento, tuve un problema.";
      setMessages((prev: any) => [...prev, { role: 'assistant', content: aiText as string }]);
    } catch (error) {
      console.error("Error Mistral:", error);
      setMessages((prev: any) => [...prev, { role: 'assistant', content: "Error de conexión." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ai-assistant-button" onClick={() => setIsOpen(!isOpen)}>
        <span>{isOpen ? '❌' : '✨'}</span>
        <span className="ai-text">LevelUp AI</span>
      </div>

      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>LevelUp Assistant</h4>
              <p>{selectedCourse ? `Viendo: ${selectedCourse.title}` : 'Mistral AI Online'}</p>
            </div>
            <button onClick={clearChat} title="Limpiar chat" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
              🗑️
            </button>
          </div>
          
          <div className="ai-chat-messages">
            {messages.map((msg: any, i: number) => (
              <div key={i} className={`message-bubble ${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {loading && <div className="message-bubble assistant pulsate">Escribiendo...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="ai-chat-input">
            <input 
              type="text" 
              placeholder="Pregunta algo..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={loading}>enviar</button>
          </div>
        </div>
      )}
    </>
  );
};