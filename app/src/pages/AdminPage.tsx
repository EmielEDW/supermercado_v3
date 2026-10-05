import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, FileText, LogOut, Upload } from 'lucide-react';

async function responseData(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'De aanvraag is niet gelukt. Probeer opnieuw.');
  return data;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Menubeheer | SUPERMERCADO';
    fetch('/api/session', { cache: 'no-store' }).then(responseData)
      .then(data => setAuthenticated(data.authenticated))
      .catch(() => setError('Het beheer is tijdelijk niet bereikbaar. Probeer opnieuw in te loggen.'))
      .finally(() => setLoading(false));
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      await responseData(await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }));
      setPassword(''); setAuthenticated(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Inloggen is niet gelukt.'); }
    finally { setBusy(false); }
  }

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const response = await fetch('/api/menu', { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: file });
      if (response.status === 401) setAuthenticated(false);
      await responseData(response);
      setSuccess('Je nieuwe menukaart staat online. Bezoekers zien vanaf nu deze pdf.');
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (e) { setError(e instanceof Error ? e.message : 'Uploaden is niet gelukt. Probeer opnieuw.'); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true); setError('');
    try {
      await responseData(await fetch('/api/session', { method: 'DELETE' }));
      setAuthenticated(false); setFile(null); setSuccess('');
    } catch { setError('Uitloggen is niet gelukt. Probeer opnieuw.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="menu-page">
      <header className="menu-header">
        <a href="/" className="menu-brand">SUPERMERCADO.</a>
        <a href="/" className="menu-back"><ArrowLeft size={18} /> Naar de website</a>
      </header>
      <main className="admin-main">
        <p className="menu-eyebrow">VOOR DE EIGENAAR</p>
        <h1>MENUBEHEER.</h1>
        <p className="admin-intro">Een nieuw seizoen, een nieuwe menukaart.</p>
        {loading ? <p role="status">Even laden…</p> : authenticated ? (
          <>
            <div className="admin-current"><div><FileText size={22} /><span>Huidige menukaart</span></div><a href="/menu" target="_blank" rel="noopener noreferrer">Bekijken <ArrowUpRight size={18} /></a></div>
            <form onSubmit={upload} className="admin-form">
              <label htmlFor="menu-file">Kies je nieuwe menukaart</label>
              <p id="file-help">Upload een pdf van maximaal 4 MB, zonder wachtwoord. Na publicatie vervangt deze de huidige menukaart.</p>
              <input ref={fileInput} id="menu-file" type="file" accept=".pdf,application/pdf" aria-describedby="file-help" disabled={busy} onChange={event => {
                const selected = event.target.files?.[0] ?? null;
                setError(''); setSuccess(''); setFile(null);
                if (selected && (!selected.name.toLowerCase().endsWith('.pdf') || selected.size === 0 || selected.size > 4_000_000)) {
                  setError('Kies een pdf van maximaal 4 MB.'); event.target.value = ''; return;
                }
                setFile(selected);
              }} />
              {file && <p className="admin-selected">{file.name} · {(file.size / 1_000_000).toFixed(2)} MB</p>}
              <button className="menu-button" type="submit" disabled={!file || busy}><Upload size={19} />{busy ? 'Even geduld…' : 'Menukaart publiceren'}</button>
            </form>
            <button className="admin-logout" type="button" onClick={logout} disabled={busy}><LogOut size={17} /> Uitloggen</button>
          </>
        ) : (
          <form className="admin-form" onSubmit={login}>
            <label htmlFor="access-code">Toegangscode</label>
            <input id="access-code" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required maxLength={256} disabled={busy} />
            <button className="menu-button" type="submit" disabled={busy || !password}>{busy ? 'Even geduld…' : 'Inloggen'}<ArrowUpRight size={19} /></button>
          </form>
        )}
        {error && <p className="admin-message admin-error" role="alert">{error}</p>}
        {success && <p className="admin-message admin-success" role="status">{success} <a href="/menu" target="_blank" rel="noopener noreferrer">Bekijk het menu ↗</a></p>}
      </main>
    </div>
  );
}
