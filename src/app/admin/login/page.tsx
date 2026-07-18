import { loginAction } from "./actions";
import { SCHOOL_NAME } from "@/lib/site";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const next = searchParams.next && searchParams.next.startsWith("/admin") ? searchParams.next : "/admin/songs";
  const hasError = searchParams.error === "1";

  return (
    <div className="admin-shell">
      <div className="admin-card" style={{ maxWidth: 420, margin: "70px auto" }}>
        <h1 className="admin-h1">เข้าสู่ระบบแอดมิน</h1>
        <p className="admin-sub">
          สำหรับครู/แอดมิน {SCHOOL_NAME} — เพิ่มและแก้ไขโน้ตเพลง
        </p>
        {hasError ? <div className="error-banner">รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้ง</div> : null}
        <form action={loginAction}>
          <input type="hidden" name="next" value={next} />
          <div className="field">
            <label htmlFor="password">รหัสผ่านแอดมิน</label>
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input id="password" name="password" type="password" required autoFocus />
          </div>
          <button type="submit" className="btn btn-green" style={{ width: "100%", justifyContent: "center" }}>
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
