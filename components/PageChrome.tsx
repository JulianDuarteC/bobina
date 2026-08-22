"use client";

import { usePathname } from "next/navigation";
import { AdSlotHeader } from "@/components/ads/AdSlotHeader";
import { Footer } from "@/components/Footer";

// La pantalla de una conversación (/messages/[id]) usa una altura fija
// de viewport calculada solo a partir del alto del NavBar. El banner de
// anuncios y el footer le quitarían ese espacio y romperían el layout,
// así que los ocultamos ahí — es una pantalla inmersiva de todos modos,
// como cualquier app de mensajería.
function isConversationScreen(pathname: string | null) {
  return /^\/messages\/.+/.test(pathname ?? "");
}

export function ChromeAdSlot() {
  const pathname = usePathname();
  if (isConversationScreen(pathname)) return null;
  return <AdSlotHeader />;
}

export function ChromeFooter() {
  const pathname = usePathname();
  if (isConversationScreen(pathname)) return null;
  return <Footer />;
}
