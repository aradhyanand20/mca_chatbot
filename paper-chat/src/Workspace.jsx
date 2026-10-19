import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import Sidebar from "./Sidebar";
import Message from "./Message";

const STARTERS = [
  "What hallucination detection methods are discussed in the papers?",
  "What limitations are reported for healthcare RAG systems?",
];

export default function Workspace({ email, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [title, setTitle] = useState("New chat");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const endRef = useRef(null);

  const loadSessions = () => api("/sessions").then(setSessions).catch((e) => setError(e.message));
  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  function newChat() {
    setSessionId(null); setTitle("New chat"); setMessages([]); setError(""); setOpen(false);
  }

  async function openSession(s) {
    setOpen(false); setError(""); setSessionId(s.id); setTitle(s.title);
    try { setMessages(await api(`/sessions/${s.id}/messages`)); }
    catch (e) { setError(e.message); }
  }

  async function removeSession(s) {
    if (!confirm("Delete this chat?")) return;
    try {
      await api(`/sessions/${s.id}`, { method: "DELETE" });
      if (s.id === sessionId) newChat();
      loadSessions();
    } catch (e) { setError(e.message); }
  }

  async function send(q) {
    q = q.trim();
    if (!q || busy) return;
    setBusy(true); setError(""); setText("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    try {
      let id = sessionId;
      if (!id) {                       // first message creates the session
        const s = await api("/sessions", { method: "POST", body: JSON.stringify({ title: q.slice(0, 48) }) });
        id = s.id; setSessionId(id); setTitle(s.title);
      }
      const a = await api(`/sessions/${id}/messages`, { method: "POST", body: JSON.stringify({ question: q }) });
      setMessages((m) => [...m, { role: "assistant", content: a.answer, sources: a.sources }]);
      loadSessions();
    } catch (e) { setError(e.message); }
    setBusy(false);
  }

  return (
    <div className="app">
      <Sidebar sessions={sessions} activeId={sessionId} email={email} open={open}
        onNew={newChat} onOpen={openSession} onDelete={removeSession} onLogout={onLogout} />
      <main>
        <header>
          <button className="menu" onClick={() => setOpen((o) => !o)} aria-label="Toggle chat history">Chats</button>
          <h2>{title}</h2>
        </header>
        <div className="msgs">
          <div className="wrap">
            {messages.length === 0 && !busy && (
              <div className="empty">
                <h3>What would you like to know from your papers?</h3>
                <p>Ask a question, and every answer comes with the passages it was based on.</p>
                <div className="chips">
                  {STARTERS.map((q) => <button key={q} className="chip" onClick={() => send(q)}>{q}</button>)}
                </div>
              </div>
            )}
            {messages.map((m, i) => <Message key={i} {...m} />)}
            {busy && <div className="msg assistant"><div className="dots" aria-label="Thinking"><i /><i /><i /></div></div>}
            {error && <div className="msg error"><div className="bubble">{error}</div></div>}
            <div ref={endRef} />
          </div>
        </div>
        <div className="composer">
          <div className="box">
            <textarea rows={1} value={text} placeholder="Ask about your papers" aria-label="Your question"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }} />
            <button className="btn" disabled={busy} onClick={() => send(text)}>Send</button>
          </div>
          <p className="note">Answers come only from your uploaded papers. This is research evidence, not medical advice.</p>
        </div>
      </main>
    </div>
  );
}
