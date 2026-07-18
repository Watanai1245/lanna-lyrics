import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function AdminTopbar({ title }: { title: string }) {
  return (
    <div className="admin-topbar">
      <Link href="/admin/songs">แอดมิน · คลังโน้ตเพลง</Link>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ color: "var(--muted)", fontSize: 14 }}>{title}</span>
        <Link href="/" style={{ fontSize: 14, fontWeight: 600 }}>
          ดูเว็บไซต์
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13.5 }}>
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
