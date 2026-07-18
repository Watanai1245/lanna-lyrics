import AdminTopbar from "@/components/AdminTopbar";
import SongForm from "@/components/admin/SongForm";

export default function NewSongPage() {
  return (
    <>
      <AdminTopbar title="เพิ่มเพลงใหม่" />
      <div className="admin-shell">
        <div className="admin-card">
          <h1 className="admin-h1">เพิ่มเพลงใหม่</h1>
          <p className="admin-sub">พิมพ์โน้ตตามต้นฉบับ ทีละห้อง แถวละ 8 ห้อง</p>
          <SongForm />
        </div>
      </div>
    </>
  );
}
