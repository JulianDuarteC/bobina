import type { Config } from "tailwindcss";

// Paleta "Bobina": inspirada en sala de proyección. Los tonos reel/
// marquee/frame están enlazados a variables CSS (ver globals.css) para
// poder cambiar de paleta completa en tiempo real vía [data-theme] en
// <html>, sin tocar ninguna clase de componente.
function themedColor(varName: string) {
  return `rgb(var(${varName}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        reel: {
          950: themedColor("--reel-950"),
          900: themedColor("--reel-900"),
          800: themedColor("--reel-800"),
          700: themedColor("--reel-700"),
          600: themedColor("--reel-600"),
        },
        marquee: {
          400: themedColor("--marquee-400"),
          500: themedColor("--marquee-500"),
          600: themedColor("--marquee-600"),
        },
        frame: {
          50: themedColor("--frame-50"),
          100: themedColor("--frame-100"),
          200: themedColor("--frame-200"),
        },
        emerald_reel: {
          // Acento de estados "visto"/éxito — se mantiene constante entre
          // temas a propósito, para que "verde = éxito" no cambie de
          // significado visual según la paleta elegida.
          500: "#1F6F5C",
          600: "#175A4A",
        },
        ink: {
          900: "#1A0B10",
          100: "#F3EADA",
        },
      },
      fontFamily: {
        display: ["var(--font-marquee)", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        marquee: "0.08em",
      },
      backgroundImage: {
        // sutil textura de grano — el elemento "firma" del sistema visual
        grain:
          "radial-gradient(circle at 1px 1px, rgb(var(--frame-100) / 0.04) 1px, transparent 0)",
      },
      backgroundSize: {
        grain: "4px 4px",
      },
    },
  },
  plugins: [],
};

export default config;
