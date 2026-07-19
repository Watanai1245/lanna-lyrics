import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PosterActions from "@/components/PosterActions";
import { getSongBySlug } from "@/lib/songs";
import { isAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const song = await getSongBySlug(params.slug);
  return { title: song ? song.title : "ไม่พบเพลง" };
}

export default async function SongDetailPage({ params }: { params: { slug: string } }) {
  const song = await getSongBySlug(params.slug);
  if (!song) notFound();
  if (!song.active && !(await isAdminSession())) notFound();

  return (
    <>
      <SiteHeader current="/songs" />
      <div className="wrap breadcrumb">
        <Link href="/">หน้าแรก</Link> / <Link href="/songs">คลังโน้ตเพลง</Link> / <b>{song.title}</b>
      </div>
      <section className="poster-wrap wrap">
        <PosterActions song={song} />
      </section>
      <SiteFooter />
    </>
  );
}
