import Link from "next/link";
import { SCHOOL_NAME, SCHOOL_SUB } from "@/lib/site";

const NAV = [
  { href: "/", label: "หน้าแรก" },
  { href: "/about", label: "ประวัติโรงเรียน" },
  { href: "/staff", label: "บุคลากร" },
  { href: "/songs", label: "คลังโน้ตเพลง" },
  { href: "/tuner", label: "เครื่องตั้งสาย" },
  { href: "/media", label: "สื่อการสอน" },
  { href: "/achievements", label: "ผลงาน" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export default function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="site-header">
      <div className="wrap site-row">
        <Link href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ตราโรงเรียนสืบสานศิลปวัฒนธรรมล้านนา" className="logo-badge" />
          <div className="brand-text">
            <div className="school-th">{SCHOOL_NAME}</div>
            <div className="school-sub">{SCHOOL_SUB}</div>
          </div>
        </Link>
        <nav className="site-nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={current === item.href ? "current" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
