import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Download } from 'lucide-react';

export default function MenuPage() {
  useEffect(() => { document.title = 'Menu | SUPERMERCADO'; }, []);
  return (
    <div className="menu-page">
      <header className="menu-header">
        <a href="/" className="menu-brand">SUPERMERCADO.</a>
        <a href="/" className="menu-back"><ArrowLeft size={18} /> Terug naar de website</a>
      </header>
      <main className="menu-main">
        <div className="menu-heading">
          <div><p className="menu-eyebrow">SEIZOENSGEBONDEN. BASKISCHE ROOTS.</p><h1>MENU.</h1></div>
          <div className="menu-actions">
            <a className="menu-button" href="/api/menu" target="_blank" rel="noopener noreferrer">Open de menukaart <ArrowUpRight size={19} /></a>
            <a className="menu-button menu-button-outline" href="/api/menu?download=1" download>Download pdf <Download size={18} /></a>
          </div>
        </div>
        <p className="menu-help">Bekijk onze menukaart hieronder. Op je telefoon kan je de pdf ook rechtstreeks openen.</p>
        <iframe className="menu-pdf" title="Menukaart SUPERMERCADO" src="/api/menu#view=FitH" />
      </main>
    </div>
  );
}
