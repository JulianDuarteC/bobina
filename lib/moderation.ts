// Motor de filtrado de texto (Fase 6 del SRS): normalización anti-evasión
// + reemplazo de expresiones prohibidas + detección de spoilers por
// palabras clave.
//
// IMPORTANTE: las listas de abajo son solo ejemplos ilustrativos del
// MECANISMO — no una lista real de moderación. Reemplázalas por tus
// propias palabras/expresiones según las políticas de tu comunidad.
// Deliberadamente no se generó aquí una lista extensa de groserías u
// odio: eso es una decisión de contenido/políticas que le corresponde
// a quien opera la plataforma, no algo que deba embeberse en el código.

const FORBIDDEN_WORDS: string[] = ["ejemploprohibido", "otrapalabraprohibida"];

const SPOILER_KEYWORDS: string[] = [
  "spoiler",
  "muere al final",
  "termina con",
  "el final revela",
];

// Mapa de sustituciones tipo leetspeak habituales, usado para construir
// una expresión regular que reconoce variantes evasivas de cada
// palabra prohibida (ej. "p4l4br4", "p a l a b r a").
const LEET_CLASSES: Record<string, string> = {
  a: "a4@",
  e: "e3",
  i: "i1!",
  o: "o0",
  s: "s5$",
  t: "t7",
  b: "b8",
};

function escapeRegex(char: string) {
  return char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildEvasionAwareRegex(word: string): RegExp {
  const body = word
    .toLowerCase()
    .split("")
    .map((ch) => {
      const cls = LEET_CLASSES[ch];
      return cls ? `[${cls}]` : escapeRegex(ch);
    })
    // Permite espacios, guiones o puntos intercalados entre letras
    // (evasión típica: "p-a-l-a-b-r-a").
    .join("[\\s\\-_.]*");

  return new RegExp(body, "gi");
}

// Reemplaza cada coincidencia de la lista de prohibidas por asteriscos
// del mismo largo, tolerando leetspeak y espacios intercalados.
export function filterProfanity(text: string): {
  filtered: string;
  hadMatch: boolean;
} {
  let filtered = text;
  let hadMatch = false;

  for (const word of FORBIDDEN_WORDS) {
    const regex = buildEvasionAwareRegex(word);
    if (regex.test(filtered)) {
      hadMatch = true;
      filtered = filtered.replace(regex, (match) => "*".repeat(match.length));
    }
  }

  return { filtered, hadMatch };
}

// Detección simple de spoilers por palabras clave. Si detecta alguna y
// el autor no marcó "Contiene spoilers", el backend fuerza el flag.
export function containsSpoilerKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return SPOILER_KEYWORDS.some((kw) => lower.includes(kw));
}
