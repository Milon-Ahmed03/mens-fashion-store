// AI Chatbot: কোণায় ভাসমান বাটন + চ্যাট উইন্ডো
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import api, { errMsg } from '../services/api';
import { money, onImgError, PLACEHOLDER } from '../utils/helpers';

const WELCOME = {
  role: 'assistant',
  text: 'Hi! I can help you find products, check stock and tell you the delivery charge. What are you looking for?',
};
const SUGGESTIONS = ['Show me hoodies', 'T-shirts under ৳1000', 'What is the delivery charge?'];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // নতুন মেসেজ এলে নিচে স্ক্রল করে
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const send = async (text) => {
    const clean = text.trim();
    if (!clean || loading) return;
    const next = [...messages, { role: 'user', text: clean }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      // স্বাগত বার্তা বাদ দিয়ে শুধু আসল কথোপকথন পাঠানো হয়
      const history = next.slice(1).map((m) => ({ role: m.role, text: m.text }));
      const { data } = await api.post('/chat', { messages: history });
      setMessages([...next, { role: 'assistant', text: data.reply, products: data.products }]);
    } catch (e) {
      setMessages([...next, { role: 'assistant', text: errMsg(e) }]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lg transition hover:scale-105 hover:bg-gray-800"
        >
          <FiMessageCircle size={26} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[34rem] max-h-[80vh] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Shopping Assistant</p>
              <p className="text-xs text-gray-300">Ask about products, stock & delivery</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><FiX size={20} /></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex flex-col items-start'}>
                <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-ink text-white' : 'border bg-white text-gray-800'}`}>
                  {m.text}
                </div>
                {m.products && m.products.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {m.products.map((p) => (
                      <Link key={p.id} to={p.path} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl border bg-white p-2 transition hover:border-ink">
                        <img src={p.image || PLACEHOLDER} alt="" onError={onImgError} className="h-16 w-14 rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="text-sm font-semibold">
                            {money(p.price)} {p.originalPrice > 0 && <span className="text-xs font-normal text-gray-400 line-through">{money(p.originalPrice)}</span>}
                          </p>
                          <p className={`text-xs font-medium ${p.inStock ? 'text-green-700' : 'text-red-600'}`}>{p.inStock ? 'In stock' : 'Out of stock'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs hover:border-ink">{s}</button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex items-start">
                <div className="flex gap-1 rounded-2xl border bg-white px-3 py-3">
                  {[0, 150, 300].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
              placeholder="Type your question..."
              className="input flex-1"
            />
            <button className="btn-primary px-3" disabled={loading || !input.trim()} aria-label="Send"><FiSend /></button>
          </form>
        </div>
      )}
    </>
  );
}
