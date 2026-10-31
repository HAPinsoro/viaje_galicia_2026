import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Bot, User, MapPin, X, ExternalLink } from 'lucide-react';
import { RouteDay } from '../types/trip';
import { useLanguage } from '../context/LanguageContext';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: RouteDay | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  groundingMetadata?: any;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedDay,
}) => {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const defaultGreeting = isFr
    ? `Bonjour ! Je suis votre copilote de voyage avec Google Maps pour l'expédition de 10 jours en Galice depuis Pinsoro (Saragosse) pour 4 personnes.\n\nJe peux vous aider à dénicher des hébergements <120€ avec parking privé ou réservé, les meilleures pulperías, des conseils de stationnement ou ajuster les horaires. Que souhaitez-vous savoir ?`
    : `¡Hola! Soy vuestro copiloto de viaje con Google Maps para la ruta de 10 días por Galicia desde Pinsoro (Zaragoza) para 4 personas.\n\nPuedo ayudaros a encontrar apartamentos céntricos <120€ con parking propio o concertado, mejores pulperías, aparcamientos cómodos o ajustar horarios. ¿Qué deseáis consultar?`;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: defaultGreeting,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = isFr
    ? [
        'Où se garer près de la Cathédrale de Saint-Jacques ?',
        'Recommande-moi d\'autres logements <120€ en Galice avec parking',
        'Où s\'arrêter pour déjeuner entre Pinsoro et Ourense ?',
        'Comment réserver pour la Plage des Cathédrales et les Cíes ?',
        'Quelles sont les meilleures pulperías à Lugo et Ourense ?',
      ]
    : [
        '¿Dónde aparcar cerca de la Catedral de Santiago?',
        'Recomiéndame más apartamentos <120€ en Galicia con parking',
        '¿Qué parada recomendáis entre Pinsoro y Ourense para comer?',
        '¿Cómo reservar para la Playa de las Catedrales y Cíes?',
        '¿Cuáles son las mejores pulperías de Lugo y Ourense?',
      ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const langPrompt = isFr
        ? `[Répondez impérativement en français] ${textToSend}`
        : textToSend;

      const response = await fetch('/api/gemini/plan-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: langPrompt,
          currentDay: selectedDay ? `Día ${selectedDay.dayNumber}: ${selectedDay.title}` : 'Ruta Completa',
          context: isFr
            ? 'Voyage 4 personnes en voiture depuis Pinsoro (Saragosse) vers la Galice en 10 jours, appartements <120€/nuit avec parking privé ou public proche, gastronomie typique et optimisation de trajet. Répondre en français.'
            : 'Viaje 4 personas en coche desde Pinsoro (Zaragoza) a Galicia en 10 días, apartamentos <120€/noche con parking propio o público cercano, gastronomía típica y optimización de ruta.',
        }),
      });

      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.text,
            groundingMetadata: data.groundingMetadata,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: isFr
              ? 'Impossible d\'obtenir une réponse pour le moment. Veuillez réessayer.'
              : 'No se pudo obtener respuesta en este momento. Inténtalo de nuevo.',
          },
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isFr ? 'Erreur de connexion avec le copilote.' : 'Error de conexión con el copiloto.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A0A0A]/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0F0F0F] border border-slate-800 w-full max-w-2xl h-[85vh] max-h-[720px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 bg-[#0F0F0F] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>{isFr ? 'Copilote Maps Grounding' : 'Copiloto Maps Grounding'}</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold">
                  {isFr ? 'EN DIRECT' : 'EN DIRECTO'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isFr
                  ? 'Informations vérifiées sur les hébergements, pulperías et routes.'
                  : 'Información grounded sobre apartamentos, pulperías y carreteras.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#0A0A0A]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 flex-shrink-0 text-xs font-bold mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-[#141414] text-slate-300 border border-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.groundingMetadata?.groundingChunks && (
                  <div className="pt-2 mt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                    <span className="font-bold text-blue-400 flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {isFr ? 'Lieux vérifiés sur Google Maps :' : 'Lugares verificados en Google Maps:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                        const title = chunk.web?.title || chunk.maps?.title || (isFr ? `Point ${i + 1}` : `Punto ${i + 1}`);
                        const uri = chunk.web?.uri || chunk.maps?.uri;
                        return (
                          uri && (
                            <a
                              key={i}
                              href={uri}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline inline-flex items-center gap-0.5 bg-[#0F0F0F] px-1.5 py-0.5 rounded border border-slate-800"
                            >
                              <span>{title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white flex-shrink-0 text-xs font-bold mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500 font-mono animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>{isFr ? 'Consultation de Google Maps en direct...' : 'Consultando Google Maps...'}</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-[#0F0F0F] border-t border-slate-800 overflow-x-auto flex gap-2 scrollbar-none no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="flex-shrink-0 text-[11px] font-mono bg-[#141414] hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#0F0F0F] border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isFr ? 'Posez votre question sur l\'itinéraire, les logements ou restaurants...' : 'Pregunta sobre la ruta, alojamientos o restaurantes...'}
              className="flex-1 bg-[#141414] border border-slate-800 rounded-lg px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition-all shadow cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
