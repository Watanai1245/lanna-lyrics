"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminSession, requireAdmin } from "@/lib/adminSession";
import { createSong, updateSong, deleteSong, setSongActive } from "@/lib/songs";
import type { SongInput } from "@/lib/types";

export async function logoutAction(): Promise<void> {
  clearAdminSession();
  redirect("/admin/login");
}

type ActionResult = { ok: true; slug: string } | { ok: false; error: string };

export async function createSongAction(input: SongInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input.title.trim()) {
    return { ok: false, error: "กรุณาใส่ชื่อเพลง" };
  }
  try {
    const song = await createSong(input);
    revalidatePath("/songs");
    revalidatePath("/");
    revalidatePath("/admin/songs");
    return { ok: true, slug: song.slug };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function updateSongAction(id: string, input: SongInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input.title.trim()) {
    return { ok: false, error: "กรุณาใส่ชื่อเพลง" };
  }
  try {
    const song = await updateSong(id, input);
    revalidatePath("/songs");
    revalidatePath("/");
    revalidatePath(`/songs/${song.slug}`);
    revalidatePath("/admin/songs");
    return { ok: true, slug: song.slug };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function deleteSongAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteSong(id);
  revalidatePath("/songs");
  revalidatePath("/");
  revalidatePath("/admin/songs");
}

export async function toggleSongActiveAction(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  const { slug } = await setSongActive(id, active);
  revalidatePath("/songs");
  revalidatePath("/");
  revalidatePath("/admin/songs");
  revalidatePath(`/songs/${slug}`);
}
