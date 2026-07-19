"use client";

import { useEffect, useRef, useState } from "react";

type StringDef = { note: string; label: string; freq: number };

const STANDARD_TUNING: StringDef[] = [
  { note: "E2", label: "สาย 6 · E ต่ำ", freq: 82.41 },
  { note: "A2", label: "สาย 5 · A", freq: 110.0 },
  { note: "D3", label: "สาย 4 · D", freq: 146.83 },
  { note: "G3", label: "สาย 3 · G", freq: 196.0 },
  { note: "B3", label: "สาย 2 · B", freq: 246.94 },
  { note: "E4", label: "สาย 1 · E สูง", freq: 329.63 },
];

const BUFFER_SIZE = 2048;
const MIN_RMS = 0.01;
const IN_TUNE_CENTS = 5;
const CLAMP_CENTS = 50;

/** Autocorrelation pitch detection (the well-known "ACF2+" technique). */
function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / size);
  if (rms < MIN_RMS) return -1;

  const threshold = 0.2;
  let r1 = 0;
  let r2 = size - 1;
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buffer[size - i]) < threshold) {
      r2 = size - i;
      break;
    }
  }
  const trimmed = buffer.slice(r1, r2);
  const n = trimmed.length;
  if (n < 2) return -1;

  const c = new Float32Array(n);
  for (let lag = 0; lag < n; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) sum += trimmed[i] * trimmed[i + lag];
    c[lag] = sum;
  }

  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;

  let maxVal = -Infinity;
  let maxPos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }
  if (maxPos <= 0) return -1;

  let t0 = maxPos;
  const x1 = c[t0 - 1] ?? c[t0];
  const x2 = c[t0];
  const x3 = c[t0 + 1] ?? c[t0];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a !== 0) t0 -= b / (2 * a);

  return t0 > 0 ? sampleRate / t0 : -1;
}

function centsOff(freq: number, target: number): number {
  return 1200 * Math.log2(freq / target);
}

function closestString(freq: number): StringDef {
  return STANDARD_TUNING.reduce((best, s) => (Math.abs(freq - s.freq) < Math.abs(freq - best.freq) ? s : best));
}

type Status = "idle" | "listening" | "denied" | "unsupported";
type Reading = { target: StringDef; cents: number; freq: number };

export default function Tuner() {
  const [status, setStatus] = useState<Status>("idle");
  const [pinned, setPinned] = useState<StringDef | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const pinnedRef = useRef<StringDef | null>(null);

  useEffect(() => {
    pinnedRef.current = pinned;
  }, [pinned]);

  function stop() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setReading(null);
    setStatus("idle");
  }

  async function start() {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;

      const AudioContextCtor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextCtor();
      audioCtxRef.current = ctx;
      await ctx.resume().catch(() => {});

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = BUFFER_SIZE;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        const freq = autoCorrelate(buffer, ctx.sampleRate);
        if (freq > 0) {
          const target = pinnedRef.current ?? closestString(freq);
          setReading({ target, cents: centsOff(freq, target.freq), freq });
        } else {
          setReading(null);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      setStatus("listening");
    } catch {
      setStatus("denied");
    }
  }

  useEffect(() => () => stop(), []);

  const cents = reading ? Math.max(-CLAMP_CENTS, Math.min(CLAMP_CENTS, reading.cents)) : 0;
  const needlePercent = 50 + (cents / CLAMP_CENTS) * 50;
  const inTune = Boolean(reading) && Math.abs(reading!.cents) <= IN_TUNE_CENTS;

  let verdict = "เล่นสายกีตาร์ได้เลย";
  if (reading) {
    if (inTune) verdict = "ตรงแล้ว ✓";
    else if (reading.cents < 0) verdict = "ต่ำไป — ขันให้ตึงขึ้น";
    else verdict = "สูงไป — คลายให้หย่อนลง";
  }

  return (
    <div className="tuner-card">
      <div className="tuner-strings">
        {STANDARD_TUNING.map((s) => {
          const isPinned = pinned?.note === s.note;
          const isActive = reading?.target.note === s.note;
          return (
            <button
              key={s.note}
              type="button"
              className={`tuner-string-btn${isPinned ? " pinned" : ""}${isActive ? " active" : ""}`}
              onClick={() => setPinned((p) => (p?.note === s.note ? null : s))}
              title={s.label}
            >
              <span className="tuner-string-note">{s.note}</span>
              <span className="tuner-string-label">{s.label}</span>
            </button>
          );
        })}
      </div>
      <p className="tuner-hint">
        {pinned ? `กำลังจับเสียงเทียบกับสาย ${pinned.note} (แตะซ้ำเพื่อยกเลิก)` : "แตะเลือกสายที่จะตั้ง หรือปล่อยไว้ให้ระบบจับสายที่ใกล้เสียงที่สุดอัตโนมัติ"}
      </p>

      <div className={`tuner-display${status === "listening" ? "" : " tuner-display-off"}`}>
        <div className="tuner-note-big">{reading ? reading.target.note : "—"}</div>
        <div className="tuner-freq">{reading ? `${reading.freq.toFixed(1)} Hz` : status === "listening" ? "กำลังฟัง…" : "ยังไม่เริ่มฟังเสียง"}</div>

        <div className="tuner-gauge">
          <div className="tuner-gauge-track">
            <div className="tuner-gauge-zone" />
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="tuner-gauge-tick" style={{ left: `${i * 10}%` }} />
            ))}
            <div
              className={`tuner-gauge-needle${reading ? (inTune ? " in-tune" : "") : ""}`}
              style={{ left: `${reading ? needlePercent : 50}%` }}
            />
          </div>
          <div className="tuner-gauge-labels">
            <span>ต่ำ</span>
            <span>ตรง</span>
            <span>สูง</span>
          </div>
        </div>

        <div className={`tuner-verdict${inTune ? " in-tune" : ""}`}>{verdict}</div>
      </div>

      <div className="tuner-controls">
        {status === "listening" ? (
          <button type="button" className="btn btn-outline" onClick={stop}>
            หยุดฟังเสียง
          </button>
        ) : (
          <button type="button" className="btn btn-green" onClick={start}>
            🎤 เริ่มฟังเสียง
          </button>
        )}
      </div>

      {status === "denied" ? (
        <p className="tuner-error">
          ไม่ได้รับสิทธิ์ใช้ไมโครโฟน — กรุณาอนุญาตการเข้าถึงไมโครโฟนในเบราว์เซอร์ แล้วลองอีกครั้ง
        </p>
      ) : null}
      {status === "unsupported" ? (
        <p className="tuner-error">เบราว์เซอร์นี้ไม่รองรับการฟังเสียงผ่านไมโครโฟน ลองเปิดด้วย Chrome หรือ Safari เวอร์ชันล่าสุด</p>
      ) : null}
    </div>
  );
}
