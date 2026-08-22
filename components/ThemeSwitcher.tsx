"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ColorTheme = "BOBINA" | "NOIR" | "TECHNICOLOR";

const THEMES: {
  value: ColorTheme;
  attr: string;
  label: string;
  swatch: string; // color representativo para el botón de muestra
}[] = [
  { value: "BOBINA", attr: "bobina", label: "Bobina", swatch: "#E8B04B" },
  { value: "NOIR", attr: "noir", label: "Noir", swatch: "#6CB3D6" },
  { value: "TECHNICOLOR", attr: "technicolor", label: "Technicolor", swatch: "#F06A42" },
];

export function ThemeSwitcher({
  userId,
  initialTheme,
}: {
  userId: string;
  initialTheme: ColorTheme;
}) {
  const [current, setCurrent] = useState(initialTheme);
  const [open, setOpen] = useState(false);

  async function selectTheme(theme: (typeof THEMES)[number]) {
    setCurrent(theme.value);
    setOpen(false);

    // Cambio visual instantáneo, sin esperar la respuesta del servidor.
    document.documentElement.setAttribute("data-theme", theme.attr);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ color_theme: theme.value })
      .eq("id", userId);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Cambiar tema de color"
        title="Tema de color"
        className="flex h-6 w-6 items-center justify-center rounded-full border border-reel-600"
      >
        <span
          className="h-3.5 w-3.5 rounded-full"
          style={{
            backgroundColor: THEMES.find((t) => t.value === current)?.swatch,
          }}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-44 rounded-sm border border-reel-700 bg-reel-900 p-2 shadow-xl">
            <p className="mb-1.5 px-1 font-body text-[11px] uppercase tracking-marquee text-frame-200/50">
              Tema de color
            </p>
            {THEMES.map((theme) => (
              <button
                key={theme.value}
                onClick={() => selectTheme(theme)}
                className={`flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left hover:bg-reel-800 ${
                  current === theme.value ? "bg-reel-800" : ""
                }`}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: theme.swatch }}
                />
                <span className="font-body text-sm text-frame-100">
                  {theme.label}
                </span>
                {current === theme.value && (
                  <span className="ml-auto text-marquee-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
