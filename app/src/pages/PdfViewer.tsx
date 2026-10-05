import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

function PdfPage({ document, number }: { document: PDFDocumentProxy; number: number }) {
  const holder = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = holder.current;
    if (!element) return;
    const resize = new ResizeObserver(entries => setWidth(Math.floor(entries[0].contentRect.width)));
    const intersection = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); intersection.disconnect(); }
    }, { rootMargin: '400px' });
    resize.observe(element); intersection.observe(element);
    return () => { resize.disconnect(); intersection.disconnect(); };
  }, []);

  useEffect(() => {
    if (!visible || !width) return;
    let cancelled = false;
    let render: RenderTask | undefined;
    void document.getPage(number).then(page => {
      if (cancelled || !canvas.current) return;
      const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const element = canvas.current;
      element.width = Math.floor(viewport.width * ratio);
      element.height = Math.floor(viewport.height * ratio);
      element.style.height = `${viewport.height}px`;
      render = page.render({ canvas: element, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
      return render.promise;
    }).catch(error => {
      if (!cancelled && error?.name !== 'RenderingCancelledException') setFailed(true);
    });
    return () => { cancelled = true; render?.cancel(); };
  }, [document, number, visible, width]);

  return <div ref={holder} className="menu-pdf-page">
    {failed ? <p>Deze pagina kan niet worden getoond. <a href="/api/menu" target="_blank" rel="noopener noreferrer">Open de pdf rechtstreeks.</a></p> : <canvas ref={canvas} role="img" aria-label={`Menukaart, pagina ${number}`} />}
  </div>;
}

export default function PdfViewer() {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const loading = getDocument({ url: '/api/menu', disableRange: true, standardFontDataUrl: '/pdfjs/standard_fonts/', cMapUrl: '/pdfjs/cmaps/', cMapPacked: true, wasmUrl: '/pdfjs/wasm/' });
    void loading.promise.then(pdf => { if (!cancelled) setDocument(pdf); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; void loading.destroy(); };
  }, []);
  if (failed) return <p className="admin-message admin-error" role="alert">De menukaart kan hier niet worden geladen. Probeer opnieuw of gebruik de knop ‘Open de menukaart’.</p>;
  if (!document) return <p role="status" className="menu-help">Menukaart laden…</p>;
  return <div className="menu-pdf" aria-label="Menukaart SUPERMERCADO">
    {Array.from({ length: document.numPages }, (_, index) => <PdfPage key={index} document={document} number={index + 1} />)}
  </div>;
}
