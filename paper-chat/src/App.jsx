import { useEffect, useState } from "react";
import { api, getToken, setToken, setOnExpired } from "./api";
import Auth from "./Auth";
import Workspace from "./Workspace";

export default function App() {
  const [email, setEmail] = useState(null);
  const [ready, setReady] = useState(!getToken());

  const logout = () => { setToken(null); setEmail(null); };

  useEffect(() => {
    setOnExpired(logout);
    if (getToken()) {
      api("/auth/me")
        .then((u) => setEmail(u.email))
        .catch(() => {})
        .finally(() => setReady(true));
    }
  }, []);

  if (!ready) return null;
  return email
    ? <Workspace email={email} onLogout={logout} />
    : <Auth onAuthed={setEmail} />;
}
