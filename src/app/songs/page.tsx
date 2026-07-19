import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SongLibrary from "@/components/SongLibrary";
import DownloadAllButton from "@/components/DownloadAllButton";
import { getAllSongs, getAllSongsFull } from "@/lib/songs";

export const dynamic = "force-dynamic";

export default async function SongsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const initialQuery = typeof searchParams.q === "string" ? searchParams.q : "";

  const [songs, allFull] = await Promise.all([getAllSongs({ activeOnly: true }), getAllSongsFull()]);

  return (
    <>
      <SiteHeader current="/songs" />
      <div className="wrap breadcrumb">
        <Link href="/">หน้าแรก</Link> / <b>คลังโน้ตเพลง</b>
      </div>
      <section className="wrap">
        <SongLibrary songs={songs} initialQuery={initialQuery} />

        <div style={{ padding: "40px 0 70px" }}>
          <DownloadAllButton songs={allFull} />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
