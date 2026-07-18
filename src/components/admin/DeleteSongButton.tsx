"use client";

import type { FormEvent } from "react";
import { deleteSongAction } from "@/app/admin/actions";

export default function DeleteSongButton({ id, title }: { id: string; title: string }) {
  function handleSubmit(e: FormEvent) {
    if (!confirm(`ลบเพลง "${title}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteSongAction.bind(null, id)} onSubmit={handleSubmit}>
      <button type="submit" className="link-btn danger">
        ลบ
      </button>
    </form>
  );
}
