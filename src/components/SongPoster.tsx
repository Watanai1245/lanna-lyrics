import type { ReactNode } from "react";
import { CATEGORY_LABELS, groupCells } from "@/lib/notation";
import { SCHOOL_NAME } from "@/lib/site";
import type { ColorMap, SongData } from "@/lib/types";

function cellStyle(colorMap: ColorMap, index: number) {
  const color = colorMap[index];
  return color ? { color } : undefined;
}

export default function SongPoster({ song, actions }: { song: SongData; actions?: ReactNode }) {
  return (
    <div className="poster">
      <div className="poster-head">
        <div>
          <div className="kicker">{CATEGORY_LABELS[song.category]}</div>
          <h1>{song.title}</h1>
          <div className="sub">{SCHOOL_NAME}</div>
        </div>
        {actions}
      </div>

      {song.sections.length === 0 ? (
        <div className="section-block" style={{ color: "var(--muted)", textAlign: "center" }}>
          ยังไม่มีโน้ตเพลงสำหรับเพลงนี้
        </div>
      ) : null}

      {song.sections.map((section) => (
        <div className="section-block" key={section.id}>
          {section.name ? <h2>{section.name}</h2> : null}

          {section.freeText ? (
            <div className="free-text">
              {section.freeText.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ) : (
            <>
              {section.introCells.length > 0 ? (
                <div className="note-grid intro-grid">
                  {section.introCells.map((c, i) => (
                    <div className="cell" key={`intro-${i}`} style={cellStyle(section.introColors, i)}>
                      {c}
                    </div>
                  ))}
                  {section.introNote ? (
                    <div
                      className="cell note-annot"
                      style={{ gridColumn: `span ${Math.max(1, 8 - section.introCells.length)}` }}
                    >
                      {section.introNote}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {groupCells(section.cells, section.lineBreaks).map((group, gi) => (
                <div className="note-grid" key={gi}>
                  {group.items.map((c, i) => {
                    const cellIndex = group.start + i;
                    return (
                      <div className="cell" key={cellIndex} style={cellStyle(section.cellColors, cellIndex)}>
                        {c}
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      {song.note ? (
        <div className="song-note">
          <b>หมายเหตุ:</b> {song.note}
        </div>
      ) : null}

      <div className="poster-foot">
        <span>คลังโน้ตเพลงล้านนา · {SCHOOL_NAME}</span>
      </div>
    </div>
  );
}
