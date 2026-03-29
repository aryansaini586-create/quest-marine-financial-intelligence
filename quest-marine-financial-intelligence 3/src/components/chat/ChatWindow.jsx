import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BarChart3, Globe, Calculator } from 'lucide-react';
import { sendMessage } from '../../services/claudeService';
import { SUGGESTED_QUESTIONS } from '../../config/api';

const CATEGORIES = [
  { label: 'Financial', icon: BarChart3, color: 'text-teal-500', questions: SUGGESTED_QUESTIONS.financial },
  { label: 'Benchmarking', icon: Globe, color: 'text-gold-500', questions: SUGGESTED_QUESTIONS.benchmarking },
  { label: 'Scenarios', icon: Calculator, color: 'text-navy-600 dark:text-blue-400', questions: SUGGESTED_QUESTIONS.scenarios },
];

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: q, ts: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const apiMessages = updated.map(m => ({ role: m.role, content: m.content }));
      const response = await sendMessage(apiMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: response, ts: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', ts: Date.now() }]);
    }
    setLoading(false);
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={i} className="font-display font-bold text-navy-900 dark:text-white mt-3 mb-1">{line.replace(/\*\*/g, '')}</h4>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={i} className="ml-4 text-sm leading-relaxed">{formatInline(line.slice(2))}</li>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>;
    });
  };

  const formatInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={i} className="font-semibold text-navy-900 dark:text-teal-400">{p.replace(/\*\*/g, '')}</strong>;
      }
      if (p.includes('⚠️')) return <span key={i} className="badge-unaudited">{p}</span>;
      return p;
    });
  };

  return (
    <div className="mt-6 flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="animate-fade-in">
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-navy-900 to-teal-500 flex items-center justify-center shadow-2xl mb-6">
                <Sparkles className="w-10 h-10 text-gold-400" />
              </div>
              <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-white mb-2">Quest Marine Intelligence</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">AI-powered financial analysis with 7 years of data. Ask me anything about QM's performance, trends, or future scenarios.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-8 max-w-4xl mx-auto">
              {CATEGORIES.map(cat => (
                <div key={cat.label} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                    <span className="font-display font-semibold text-sm">{cat.label}</span>
                  </div>
                  <div className="space-y-2">
                    {cat.questions.slice(0, 3).map(q => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="w-full text-left text-xs text-gray-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-teal-400 py-1.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all leading-snug"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <div className="space-y-1">{formatMessage(msg.content)}</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="chat-bubble-bot">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                Analyzing QM financials...
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="mt-4 pb-2">
        <div className="glass-card flex items-center gap-3 p-2 pr-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about Quest Marine's financials..."
            className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary p-2.5 rounded-xl disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
