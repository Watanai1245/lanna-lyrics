import type { Metadata } from "next";
import { SITE_TITLE, SCHOOL_NAME } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: SITE_TITLE, template: `%s · ${SITE_TITLE}` },
  description: `เว็บไซต์ ${SCHOOL_NAME} วัดวชิรธรรมสาธิต — คลังโน้ตเพลงพื้นบ้านล้านนาและข้อมูลโรงเรียน`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
