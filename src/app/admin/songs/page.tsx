import Link from "next/link";
import AdminTopbar from "@/components/AdminTopbar";
import AdminSongsTable from "@/components/admin/AdminSongsTable";
import { getAllSongs } from "@/lib/songs";

export const dynamic = "force-dynamic";

export default async function AdminSongsPage() {
  const songs = await getAllSongs();

  return (
    <>
      <AdminTopbar title="รายการโน้ตเพลง" />
      <div className="admin-shell">
        <div className="admin-actions-row">
          <div>
            <h1 className="admin-h1" style={{ marginBottom: 2 }}>
              โน้ตเพลงทั้งหมด
            </h1>
            <p className="admin-sub" style={{ marginBottom: 0 }}>
              {songs.length} เพลงในคลัง
            </p>
          </div>
          <Link href="/admin/songs/new" className="btn btn-green">
            + เพิ่มเพลงใหม่
          </Link>
        </div>

        <AdminSongsTable songs={songs} />
      </div>
    </>
  );
}
