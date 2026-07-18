import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function ComingSoon({
  current,
  title,
  description,
}: {
  current: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <SiteHeader current={current} />
      <div className="wrap" style={{ padding: "90px 20px", textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "var(--gold)", fontWeight: 800, letterSpacing: "0.12em", fontSize: 14 }}>
          เร็วๆ นี้
        </div>
        <h1 style={{ fontSize: 34, marginTop: 10 }}>{title}</h1>
        <p style={{ color: "var(--muted)", maxWidth: "56ch", margin: "16px auto 0", lineHeight: 1.7 }}>{description}</p>
      </div>
      <SiteFooter />
    </>
  );
}
