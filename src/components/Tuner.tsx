"use client";

import { useEffect, useRef, useState } from "react";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STRIP_UNIT_PERCENT = 22; // horizontal % of width per semitone on the note filmstrip
const STRIP_RADIUS = 3; // how many semitones either side of center to render

const BUFFER_SIZE = 2048;
const MIN_RMS = 0.01;
const IN_TUNE_CENTS = 5;
const CLAMP_CENTS = 50;
const HISTORY_SIZE = 7; // frames averaged (via median) to steady the note strip
const JUMP_RESET_SEMITONES = 6; // a bigger jump than this snaps instantly instead of easing in

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

/** Continuous (fractional) MIDI note number for a frequency, A4 = 440Hz = note 69. */
function continuousMidiOf(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

function noteNameAt(midi: number): string {
  return NOTE_NAMES[((midi % 12) + 12) % 12];
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

type Status = "idle" | "listening" | "denied" | "unsupported";
type Reading = { freq: number; smoothedMidi: number; cents: number };

function HzReadout({ value }: { value: number | null }) {
  const text = value ? value.toFixed(1) : "---.-";
  return (
    <div className="tuner-hz">
      {text.split("").map((ch, i) => (
        <span key={i} className={ch === "." ? "tuner-hz-dot" : "tuner-hz-digit"}>
          {ch}
        </span>
      ))}
      <span className="tuner-hz-unit">Hz</span>
    </div>
  );
}

export default function Tuner() {
  const [status, setStatus] = useState<Status>("idle");
  const [reading, setReading] = useState<Reading | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const historyRef = useRef<number[]>([]);

  function stop() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    historyRef.current = [];
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
          const midi = continuousMidiOf(freq);
          const hist = historyRef.current;
          if (hist.length > 0 && Math.abs(midi - median(hist)) > JUMP_RESET_SEMITONES) {
            hist.length = 0;
          }
          hist.push(midi);
          if (hist.length > HISTORY_SIZE) hist.shift();
          const smoothedMidi = median(hist);
          const cents = (smoothedMidi - Math.round(smoothedMidi)) * 100;
          setReading({ freq, smoothedMidi, cents });
        } else {
          historyRef.current = [];
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

  const inTune = Boolean(reading) && Math.abs(reading!.cents) <= IN_TUNE_CENTS;
  const cents = reading ? Math.max(-CLAMP_CENTS, Math.min(CLAMP_CENTS, reading.cents)) : 0;
  const markerPercent = 50 - (cents / CLAMP_CENTS) * 50;

  const smoothedMidi = reading ? reading.smoothedMidi : 69;
  const centerN = Math.round(smoothedMidi);
  const strip = Array.from({ length: STRIP_RADIUS * 2 + 1 }, (_, i) => {
    const n = centerN - STRIP_RADIUS + i;
    return { n, name: noteNameAt(n), left: 50 + (smoothedMidi - n) * STRIP_UNIT_PERCENT };
  });

  const fillFrom = Math.min(50, markerPercent);
  const fillTo = Math.max(50, markerPercent);

  return (
    <div className="tuner-card">
      <p className="tuner-hint">
        {status === "listening"
          ? "ดีดสายหรือเป่าโน้ต แล้วดูตัวโน้ตที่อยู่กลางเส้นแดง — จะเป็นสีเขียวเมื่อเสียงตรง"
          : "กดเริ่มฟังเสียง แล้วเล่นโน้ตที่ต้องการตั้ง ระบบจะจับโน้ตที่ใกล้เคียงที่สุดให้อัตโนมัติ"}
      </p>

      <div className={`tuner-strip-panel${status === "listening" ? "" : " tuner-strip-panel-off"}`}>
        <div className="tuner-center-line" />

        <div className="tuner-cents-row">
          <div className="tuner-cents-track">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="tuner-cents-tick" style={{ left: `${i * 5}%` }} />
            ))}
            {reading ? (
              <div
                className={`tuner-cents-fill${inTune ? " in-tune" : ""}`}
                style={{ left: `${fillFrom}%`, width: `${fillTo - fillFrom}%` }}
              />
            ) : null}
            <span className="tuner-cents-label plus">+10</span>
            <span className="tuner-cents-label minus">-10</span>
            {reading ? (
              <div
                className={`tuner-cents-marker${inTune ? " in-tune" : ""}`}
                style={{ left: `${markerPercent}%` }}
              />
            ) : null}
          </div>
        </div>

        <div className="tuner-note-strip">
          {strip.map((cell) => (
            <div
              key={cell.n}
              className={`tuner-note-cell${cell.n === centerN && inTune ? " in-tune" : ""}`}
              style={{ left: `${cell.left}%` }}
            >
              {cell.name}
            </div>
          ))}
        </div>
      </div>

      <HzReadout value={reading ? reading.freq : null} />

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
