export default function Sidebar({ sessions, activeId, email, open, onNew, onOpen, onDelete, onLogout }) {
  return (
    <aside className={"side" + (open ? " open" : "")}>
      <div className="side-top">
        <div className="brand">Paper Chat</div>
        <button className="new" onClick={onNew}>New chat</button>
      </div>
      <div className="sessions">
        {sessions.length === 0 && <div className="nohist">Your past chats will show up here.</div>}
        {sessions.map((s) => (
          <div key={s.id} className={"sess" + (s.id === activeId ? " on" : "")}>
            <button className="t" onClick={() => onOpen(s)}>{s.title}</button>
            <button className="x" aria-label={"Delete chat: " + s.title} onClick={() => onDelete(s)}>×</button>
          </div>
        ))}
      </div>
      <div className="side-bot">
        <span>{email}</span>
        <button className="link" onClick={onLogout}>Sign out</button>
      </div>
    </aside>
  );
}
