import { AdSlot } from "./AdSlot";

// Anuncio in-feed, inyectado cada 10 elementos del feed principal
// (según el SRS). Mismo tamaño que el rectángulo, pero centrado y con
// su propia etiqueta para dejar claro que es contenido patrocinado
// dentro del scroll de reseñas.
export function AdSlotFeed() {
  return (
    <div className="flex justify-center py-2">
      <AdSlot
        size={{ width: 300, height: 250 }}
        slotId="feed-native"
        label="Publicidad"
      />
    </div>
  );
}
