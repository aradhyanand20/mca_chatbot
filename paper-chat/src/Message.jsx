// React escapes text automatically, so model output can never inject HTML here.
export default function Message({ role, content, sources }) {
  return (
    <div className={"msg " + role}>
      <div className="bubble">{content}</div>
      {sources?.length > 0 && (
        <div className="srcs">
          <div className="srcs-h">Based on {sources.length} passage{sources.length > 1 ? "s" : ""}</div>
          {sources.map((s, i) => (
            <details key={i}>
              <summary>{s.title || "Untitled paper"}, page {s.page ?? "?"}</summary>
              <p>{s.snippet}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
