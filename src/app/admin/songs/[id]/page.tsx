import { notFound } from "next/navigation";
import AdminTopbar from "@/components/AdminTopbar";
import SongForm from "@/components/admin/SongForm";
import { getSongById } from "@/lib/songs";

export const dynamic = "force-dynamic";

export default async function EditSongPage({ params }: { params: { id: string } }) {
  const song = await getSongById(params.id);
  if (!song) notFound();

  return (
    <>
      <AdminTopbar title={`แก้ไข: ${song.title}`} />
      <div className="admin-shell">
        <div className="admin-card">
          <h1 className="admin-h1">แก้ไขเพลง</h1>
          <p className="admin-sub">{song.title}</p>
          <SongForm initialSong={song} />
        </div>
      </div>
    </>
  );
}
