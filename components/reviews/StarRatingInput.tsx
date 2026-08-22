"use client";

// 10 medias-estrellas = rango de 0.5 a 5.0. Cada "media estrella" clickeable
// es la mitad izquierda o derecha de un ícono de estrella.
export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const halves = Array.from({ length: 10 }, (_, i) => (i + 1) * 0.5);

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const leftValue = halves[starIndex * 2];
        const rightValue = halves[starIndex * 2 + 1];
        const fill =
          value >= rightValue ? "full" : value >= leftValue ? "half" : "empty";

        return (
          <div key={starIndex} className="relative h-7 w-7 text-2xl leading-none">
            <span className="pointer-events-none absolute inset-0 text-reel-700">
              ★
            </span>
            <span
              className="pointer-events-none absolute inset-0 overflow-hidden text-marquee-500"
              style={{
                width: fill === "full" ? "100%" : fill === "half" ? "50%" : "0%",
              }}
            >
              ★
            </span>
            <button
              type="button"
              aria-label={`${leftValue} estrellas`}
              className="absolute inset-y-0 left-0 w-1/2"
              onClick={() => onChange(leftValue)}
            />
            <button
              type="button"
              aria-label={`${rightValue} estrellas`}
              className="absolute inset-y-0 right-0 w-1/2"
              onClick={() => onChange(rightValue)}
            />
          </div>
        );
      })}

      <span className="ml-2 font-body text-sm text-frame-200/70">
        {value > 0 ? value.toFixed(1) : "Sin calificar"}
      </span>
    </div>
  );
}
