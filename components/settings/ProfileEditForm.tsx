"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bannerPositionY: number;
  bio: string | null;
  location: string | null;
  colorTheme: "BOBINA" | "NOIR" | "TECHNICOLOR" | "PINK" | "WHITE" | "MONO";
};

const COLOR_THEMES = [
  { value: "BOBINA" as const, attr: "bobina", label: "Bobina", swatch: "#E8B04B", desc: "Sala de cine clásica" },
  { value: "NOIR" as const, attr: "noir", label: "Noir", swatch: "#6CB3D6", desc: "Cine negro, alto contraste" },
  { value: "TECHNICOLOR" as const, attr: "technicolor", label: "Technicolor", swatch: "#F06A42", desc: "Glamour retro de Hollywood" },
  { value: "PINK" as const, attr: "pink", label: "Rosa", swatch: "#FF3D8A", desc: "Magenta vibrante sobre oscuro" },
  { value: "WHITE" as const, attr: "white", label: "Blanco", swatch: "#BE8A36", desc: "Fondo claro, acento dorado" },
  { value: "MONO" as const, attr: "mono", label: "Monocromo", swatch: "#B0B0B5", desc: "Escala de grises, sin color" },
];

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl);
  const [bannerPositionY, setBannerPositionY] = useState(profile.bannerPositionY);
  const [colorTheme, setColorTheme] = useState(profile.colorTheme);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function uploadImage(
    file: File,
    kind: "avatar" | "banner"
  ): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/${kind}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-media")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(
        `No pudimos subir la imagen (${uploadError.message}). ¿Ya creaste el bucket "profile-media" en Supabase?`
      );
      return null;
    }

    const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
    // Cache-busting: añadimos un timestamp para que el navegador no muestre
    // la versión vieja en caché tras subir un reemplazo.
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError(null);
    const url = await uploadImage(file, "avatar");
    if (url) setAvatarUrl(url);
    setUploadingAvatar(false);
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    setError(null);
    const url = await uploadImage(file, "banner");
    if (url) setBannerUrl(url);
    setUploadingBanner(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    // Update directo a la tabla vía Supabase client: respeta la política
    // RLS que dejamos configurada ("solo el dueño edita su perfil").
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        banner_position_y: bannerPositionY,
        color_theme: colorTheme,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError("No pudimos guardar los cambios. Intenta de nuevo.");
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div>
        <label className="field-label">Banner</label>
        <div className="relative h-32 w-full overflow-hidden rounded-sm bg-reel-800 sm:h-40">
          {bannerUrl && (
            <Image
              src={bannerUrl}
              alt=""
              fill
              className="object-cover"
              style={{ objectPosition: `center ${bannerPositionY}%` }}
            />
          )}
        </div>
        <label className="btn-ghost mt-2 inline-block cursor-pointer !px-4 !py-1.5 !text-xs">
          {uploadingBanner ? "Subiendo..." : "Cambiar banner"}
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            disabled={uploadingBanner}
            className="hidden"
          />
        </label>

        {bannerUrl && (
          <div className="mt-3">
            <label htmlFor="bannerPosition" className="field-label">
              Posición del banner
            </label>
            <input
              id="bannerPosition"
              type="range"
              min={0}
              max={100}
              value={bannerPositionY}
              onChange={(e) => setBannerPositionY(Number(e.target.value))}
              className="w-full accent-marquee-500"
            />
            <p className="mt-1 font-body text-xs text-frame-200/50">
              Ajusta qué parte de la imagen se ve dentro del recuadro fijo de
              arriba — así se va a ver igual en tu perfil.
            </p>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div>
        <label className="field-label">Avatar</label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-reel-700">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-2xl text-marquee-500">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <label className="btn-ghost cursor-pointer !px-4 !py-1.5 !text-xs">
            {uploadingAvatar ? "Subiendo..." : "Cambiar avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploadingAvatar}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Nombre para mostrar */}
      <div>
        <label htmlFor="displayName" className="field-label">
          Nombre para mostrar
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={profile.username}
          className="field-input"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="field-label">
          Biografía
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={250}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Cuéntanos sobre tus gustos de cine..."
          className="field-input resize-none"
        />
        <p className="mt-1 text-right font-body text-xs text-frame-200/40">
          {bio.length}/250
        </p>
      </div>

      {/* Ubicación */}
      <div>
        <label htmlFor="location" className="field-label">
          Ubicación
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Bogotá, Colombia"
          className="field-input"
        />
      </div>

      {/* Tema de color */}
      <div>
        <label className="field-label">Tema de color</label>
        <div className="grid grid-cols-3 gap-3">
          {COLOR_THEMES.map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => {
                setColorTheme(theme.value);
                document.documentElement.setAttribute("data-theme", theme.attr);
              }}
              className={`rounded-sm border px-3 py-3 text-left transition-colors ${
                colorTheme === theme.value
                  ? "border-marquee-500 bg-reel-800"
                  : "border-reel-700 hover:border-reel-600"
              }`}
            >
              <span
                className="mb-2 block h-6 w-6 rounded-full"
                style={{ backgroundColor: theme.swatch }}
              />
              <span className="block font-body text-sm font-semibold text-frame-50">
                {theme.label}
              </span>
              <span className="block font-body text-[11px] text-frame-200/50">
                {theme.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="font-body text-sm text-marquee-400">{error}</p>}
      {saved && (
        <p className="font-body text-sm text-emerald_reel-500">
          Cambios guardados ✓
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || uploadingAvatar || uploadingBanner}
          className="btn-primary"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${profile.username}`)}
          className="btn-ghost"
        >
          Volver al perfil
        </button>
      </div>
    </div>
  );
}
