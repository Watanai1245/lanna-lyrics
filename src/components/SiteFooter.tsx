import { SCHOOL_NAME } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <h5>{SCHOOL_NAME}</h5>
            <p>วัดวชิรธรรมสาธิต แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร</p>
          </div>
          <div>
            <h5>เมนู</h5>
            <a href="/about">ประวัติโรงเรียน</a>
            <a href="/staff">บุคลากร</a>
            <a href="/songs">คลังโน้ตเพลง</a>
          </div>
          <div>
            <h5>เพิ่มเติม</h5>
            <a href="/achievements">ผลงานนักเรียน</a>
            <a href="/media">สื่อการสอน</a>
            <a href="/admin/login">สำหรับครู/แอดมิน</a>
          </div>
          <div>
            <h5>ติดต่อ</h5>
            <a href="/contact">ช่องทางติดต่อ</a>
          </div>
        </div>
        <div className="foot-bottom">© {SCHOOL_NAME} วัดวชิรธรรมสาธิต</div>
      </div>
    </footer>
  );
}
