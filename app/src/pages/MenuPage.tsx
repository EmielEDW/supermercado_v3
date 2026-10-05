import { lazy, Suspense, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Download } from 'lucide-react';

const PdfViewer = lazy(() => import('./PdfViewer'));

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
          <h1 className="text-[#c41e3a]">MENU.</h1>
          <div className="menu-actions">
            <a className="menu-button" href="/api/menu" target="_blank" rel="noopener noreferrer">Open de menukaart <ArrowUpRight size={19} /></a>
            <a className="menu-button menu-button-outline" href="/api/menu?download=1" download>Download pdf <Download size={18} /></a>
          </div>
        </div>
        <div className="mt-8">
          <Suspense fallback={<p role="status">Menukaart laden…</p>}><PdfViewer /></Suspense>
        </div>
      </main>
    </div>
  );
}
