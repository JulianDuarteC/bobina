import { AdSlot } from "./AdSlot";

// Leaderboard 728x90, debajo de la barra de navegación, solo en
// escritorio (según el SRS).
export function AdSlotHeader() {
  return (
    <div className="hidden justify-center border-b border-reel-800 py-2 md:flex">
      <AdSlot
        size={{ width: 728, height: 90 }}
        slotId="header-leaderboard"
        label="Publicidad"
      />
    </div>
  );
}
