"use client";

import { useState } from "react";
import { InviteModal } from "./InviteModal";

export function InviteButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost">
        Invitar
      </button>
      {open && <InviteModal slug={slug} onClose={() => setOpen(false)} />}
    </>
  );
}
