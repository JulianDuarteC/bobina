"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type AdSlotSize = { width: number; height: number };

// Se configura poniendo tu ID de cliente de AdSense (o adaptando el
// bloque de abajo a la red que uses) en .env como
// NEXT_PUBLIC_ADSENSE_CLIENT_ID. Mientras no exista, el componente
// muestra un placeholder — nunca inventa un anuncio real.
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export function AdSlot({
  size,
  slotId,
  label = "Publicidad",
  className = "",
}: {
  size: AdSlotSize;
  /** Identificador del bloque de anuncio ("ad unit") en tu red publicitaria. */
  slotId: string;
  label?: string;
  className?: string;
}) {
  const baitRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  // Detección de adblocker: los bloqueadores suelen ocultar por CSS
  // cualquier elemento con clases como "adsbygoogle"/"ad-banner", sin
  // siquiera necesitar bloquear una petición de red. Si nuestro
  // elemento "cebo" queda oculto/con altura cero, asumimos que hay un
  // bloqueador activo.
  useEffect(() => {
    const timer = setTimeout(() => {
      const bait = baitRef.current;
      const hidden =
        !bait ||
        bait.offsetHeight === 0 ||
        bait.offsetParent === null ||
        getComputedStyle(bait).display === "none";
      setBlocked(hidden);
      setChecked(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`mx-auto w-full shrink-0 overflow-hidden ${className}`}
      // maxWidth (no width fijo) evita que el anuncio desborde en
      // celulares muy angostos; la altura sí queda fija para prevenir
      // el Cumulative Layout Shift (CLS).
      style={{ maxWidth: size.width, height: size.height }}
    >
      {/* "Cebo" invisible, solo para la detección de arriba */}
      <div
        ref={baitRef}
        className="adsbygoogle ad-banner adsbox ad-placement"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        aria-hidden
      />

      {!checked ? (
        <div className="h-full w-full animate-pulse rounded-sm bg-reel-800" />
      ) : blocked || !ADSENSE_CLIENT_ID ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-reel-700 bg-reel-900/40">
          <span className="font-body text-[10px] uppercase tracking-marquee text-frame-200/40">
            {label}
          </span>
          <span className="font-body text-[10px] text-frame-200/30">
            {size.width}×{size.height}
          </span>
        </div>
      ) : (
        <>
          {/* Inyección diferida del script del proveedor (lazyOnload)
              para no afectar el tiempo de carga de las métricas web. */}
          <Script
            id={`adsbygoogle-loader-${slotId}`}
            strategy="lazyOnload"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            onLoad={() => {
              try {
                // @ts-ignore — adsbygoogle es inyectado por el script externo
                (window.adsbygoogle = window.adsbygoogle || []).push({});
              } catch {
                // Si el proveedor falla en tiempo de ejecución, no rompemos la página.
              }
            }}
          />
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: size.width, height: size.height }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={slotId}
          />
        </>
      )}
    </div>
  );
}
