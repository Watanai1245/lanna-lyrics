import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Tuner from "@/components/Tuner";

export const metadata: Metadata = { title: "เครื่องตั้งสาย" };

export default function TunerPage() {
  return (
    <>
      <SiteHeader current="/tuner" />
      <div className="wrap breadcrumb">
        <Link href="/">หน้าแรก</Link> / <b>เครื่องตั้งสาย</b>
      </div>
      <section className="wrap section-pad">
        <div className="section-head">
          <div className="eyebrow">เครื่องมือฝึกซ้อม</div>
          <h1>เครื่องตั้งสายกีตาร์</h1>
          <p>
            เปิดไมโครโฟนแล้วดีดสายกีตาร์ทีละสาย ระบบจะฟังเสียงและบอกว่าสายนั้นตรง สูง หรือต่ำไป
            รองรับการตั้งสายมาตรฐาน (Standard EADGBE)
          </p>
        </div>
        <Tuner />
      </section>
      <SiteFooter />
    </>
  );
}
