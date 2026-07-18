import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SongCard from "@/components/SongCard";
import { getFeaturedSongs } from "@/lib/songs";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedSongs(4);

  return (
    <>
      <SiteHeader current="/" />

      <section className="hero-section">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">โรงเรียนสืบสานศิลปวัฒนธรรมล้านนา วัดวชิรธรรมสาธิต</div>
            <h1>สืบสาน สร้างสรรค์
              <br />
              มรดกศิลปวัฒนธรรมล้านนา
            </h1>
            <p>
              เว็บไซต์ของโรงเรียน รวมประวัติความเป็นมา บุคลากร ผลงานนักเรียน และคลังโน้ตเพลงพื้นบ้านล้านนาที่ดาวน์โหลดไปฝึกซ้อมได้จริง
            </p>
            <div className="hero-cta">
              <Link href="/songs" className="btn btn-gold">
                เข้าคลังโน้ตเพลง →
              </Link>
              <Link href="/about" className="btn btn-outline-light">
                รู้จักโรงเรียนของเรา
              </Link>
            </div>
          </div>
          <div className="hero-emblem">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero-temple.png" alt="เจดีย์วัดพระธาตุหริภุญชัย" className="hero-temple-img" />
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="wrap stats-row">
          <div className="stat">
            <div className="num">30+</div>
            <div className="label">โน้ตเพลงในคลัง</div>
          </div>
          <div className="stat">
            <div className="num">3</div>
            <div className="label">หมวดการแสดง</div>
          </div>
          <div className="stat">
            <div className="num">12</div>
            <div className="label">บุคลากรครูดนตรี</div>
          </div>
          <div className="stat">
            <div className="num">20+</div>
            <div className="label">ปีแห่งการสืบสาน</div>
          </div>
        </div>
      </div>

      <section className="section-pad wrap">
        <div className="section-head">
          <div className="eyebrow">สำรวจเว็บไซต์</div>
          <h2>ทุกเรื่องราวของโรงเรียน ในที่เดียว</h2>
          <p>นอกจากคลังโน้ตเพลง เว็บไซต์นี้จะขยายให้ครอบคลุมทุกด้านของโรงเรียนในระยะถัดไป</p>
        </div>
        <div className="explore-grid">
          <Link href="/about" className="xcard">
            <div className="ico">🏯</div>
            <h3>ประวัติโรงเรียน</h3>
            <div className="desc">ความเป็นมาของโรงเรียนและวัดวชิรธรรมสาธิต เจตนารมณ์การสืบสานศิลปวัฒนธรรมล้านนา</div>
            <div className="go">อ่านเพิ่มเติม →</div>
          </Link>
          <Link href="/staff" className="xcard">
            <div className="ico">👥</div>
            <h3>บุคลากร</h3>
            <div className="desc">ทำเนียบครูผู้สอนดนตรีและนาฏศิลป์ล้านนา พร้อมความเชี่ยวชาญของแต่ละท่าน</div>
            <div className="go">ดูทำเนียบครู →</div>
          </Link>
          <Link href="/songs" className="xcard featured">
            <div className="ico">🎼</div>
            <h3>คลังโน้ตเพลงล้านนา</h3>
            <div className="desc">โน้ตเพลง ซอ ฟ้อน และรำวง จัดเป็นแผ่นเดียวต่อเพลง ดาวน์โหลดเก็บไปฝึกซ้อมได้ทันที</div>
            <div className="go">เข้าคลังโน้ตเพลง →</div>
          </Link>
          <Link href="/achievements" className="xcard">
            <div className="ico">🏆</div>
            <h3>ผลงานนักเรียน</h3>
            <div className="desc">รางวัลและการแสดงของวงดนตรีล้านนา ทั้งในและนอกสถานที่</div>
            <div className="go">ชมผลงาน →</div>
          </Link>
          <Link href="/media" className="xcard">
            <div className="ico">📚</div>
            <h3>สื่อการสอน</h3>
            <div className="desc">คลิปสอนตีกลอง วิดีโอสาธิตท่าฟ้อน และเอกสารประกอบการเรียน</div>
            <div className="go">ดูสื่อการสอน →</div>
          </Link>
          <Link href="/contact" className="xcard">
            <div className="ico">✉️</div>
            <h3>ติดต่อเรา</h3>
            <div className="desc">ที่อยู่ เบอร์ติดต่อ แผนที่ และช่องทางโซเชียลของโรงเรียน</div>
            <div className="go">ดูช่องทางติดต่อ →</div>
          </Link>
        </div>
      </section>

      <section className="section-pad songs-module">
        <div className="wrap">
          <div className="songs-head">
            <div>
              <div className="eyebrow" style={{ color: "var(--green)" }}>
                คลังโน้ตเพลงล้านนา
              </div>
              <h2>ตัวอย่างเพลงล่าสุดในคลัง</h2>
              <p>ทุกเพลงจัดในเทมเพลตเดียวกัน อ่านง่าย ดาวน์โหลดเป็นภาพหรือพิมพ์ออกมาซ้อมได้จริง</p>
            </div>
            <Link href="/songs" className="btn btn-green">
              ดูโน้ตเพลงทั้งหมด →
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="empty-state">ยังไม่มีเพลงในคลัง — เข้าสู่ระบบแอดมินเพื่อเริ่มเพิ่มโน้ตเพลง</p>
          ) : (
            <div className="song-grid">
              {featured.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
