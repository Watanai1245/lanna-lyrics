import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <div className="wrap empty-state" style={{ padding: "90px 20px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>ไม่พบหน้านี้</h1>
        <p style={{ marginBottom: 24 }}>อาจถูกย้ายหรือยังไม่เปิดใช้งาน</p>
        <Link href="/" className="btn btn-green">
          กลับหน้าแรก
        </Link>
      </div>
      <SiteFooter />
    </>
  );
}
