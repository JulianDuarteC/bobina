import { AdSlot } from "./AdSlot";

// Rectángulo 300x250, para la columna lateral de la ficha de película
// y de perfiles (según el SRS).
export function AdSlotSidebar() {
  return (
    <AdSlot
      size={{ width: 300, height: 250 }}
      slotId="sidebar-rectangle"
      label="Publicidad"
      className="mx-auto"
    />
  );
}
