# คลังโน้ตเพลงล้านนา

เว็บไซต์โรงเรียนสืบสานศิลปวัฒนธรรมล้านนา วัดวชิรธรรมสาธิต — คลังโน้ตเพลงพื้นบ้านล้านนา (เพลง / ซอ / ฟ้อน-รำวง) ให้นักเรียนดูและดาวน์โหลดเป็นภาพ พร้อมระบบแอดมินสำหรับครูให้พิมพ์โน้ตเพิ่มเอง

Stack: Next.js 14 (App Router) · Prisma · PostgreSQL · plain CSS (ไม่มี framework CSS เพิ่ม)

## เริ่มต้นแบบเร็วที่สุด — Docker Compose

รันทั้งเว็บและฐานข้อมูลใน container เดียวกัน เหมาะกับการรีวิวงานหรือรันในเครื่องที่ไม่อยากติดตั้ง Node/Postgres เอง

```bash
cp .env.example .env   # แก้ ADMIN_PASSWORD / ADMIN_SESSION_SECRET ตามต้องการ
docker compose up --build
```

- เว็บไซต์: http://localhost:3000
- ฐานข้อมูลจะถูก migrate อัตโนมัติก่อนเว็บเริ่มทำงาน (service `migrate`)
- ยังไม่มีข้อมูลตัวอย่าง — รัน seed แยกอีกครั้ง (ดูหัวข้อ "ข้อมูลตัวอย่าง" ด้านล่าง)

## เริ่มต้นแบบ dev (npm + Docker เฉพาะฐานข้อมูล)

เหมาะกับตอนพัฒนา เพราะได้ hot reload ของ `next dev`

```bash
docker compose up -d db          # เปิดแค่ Postgres
cp .env.example .env
npm install
npm run prisma:migrate:dev       # สร้างตาราง
npm run seed                     # ใส่ข้อมูลตัวอย่าง (5 เพลงจากต้นฉบับ)
npm run dev
```

เปิด http://localhost:3000 — หน้าแอดมิน: http://localhost:3000/admin/login (รหัสผ่านจาก `ADMIN_PASSWORD` ใน `.env`)

## ข้อมูลตัวอย่าง (seed)

`prisma/seed.ts` ใส่เพลงจริงที่ transcribe จากไฟล์ต้นฉบับ 5 เพลง (ปราสาทไหว, ล่องแม่ปิง, กุหลาบเชียงใหม่, รำวงลอยกระทง, ซอ ปั่นฝ้าย) ไว้ให้ดูตัวอย่างการแสดงผล — ลบ/แก้ไขผ่านหน้าแอดมินได้ตามจริง

```bash
npm run seed
```

รันซ้ำได้ปลอดภัย (upsert ตาม slug)

## โครงสร้างข้อมูล

- **Song** — ชื่อเพลง, slug (ใช้เป็น URL), หมวดหมู่ (เพลง/ซอ/ฟ้อน-รำวง), หน้าอ้างอิงจากต้นฉบับ, ลำดับแสดงผล
- **Section** — 1 ท่อนของเพลง (เช่น "ท่อน ซอล") มี:
  - `introCells` + `introNote` — ท่อนขึ้นต้น (pickup line) ถ้ามี เช่น `- - - ซ` / `- ซ ซ ซ` / `( เล่นแค่รอบแรก )`
  - `cells` — รายการห้องโน้ตแบบเรียงต่อกัน (เช่น `"ซ ดํ ท ซ"`) หน้าเว็บจะจัดเรียง 8 ห้องต่อบรรทัดให้อัตโนมัติ ตรงกับต้นฉบับ

หน้าแอดมิน (`/admin/songs/new`, `/admin/songs/[id]`) มีตัวแก้ไขที่พิมพ์ทีละห้องเป็นตาราง 8 ช่องต่อแถว ไม่ต้องยุ่งกับ JSON ตรงๆ

## ฟีเจอร์หลัก

- หน้าแรกของโรงเรียน + เมนูสำหรับหน้าที่จะเพิ่มในอนาคต (ประวัติ, บุคลากร, ผลงาน, สื่อการสอน, ติดต่อ — ตอนนี้เป็นหน้า "เร็วๆ นี้")
- คลังโน้ตเพลง กรองตามหมวดหมู่ (`/songs`)
- หน้าโน้ตเพลงเดี่ยว (`/songs/[slug]`) — ตารางโน้ต 8 ห้อง/บรรทัด ปรับขนาดตัวอักษรตามหน้าจอ ไม่มีการเลื่อนแนวนอน
  - **ดาวน์โหลดภาพ** — แปลงหน้าโน้ตเป็น PNG ทั้งแผ่น (ฝั่ง client ด้วย `html-to-image`)
  - **ดูเต็มจอ** — แสดงภาพเดียวกันแบบเต็มจอ ปรับพอดีจอทั้งแนวตั้ง/แนวนอนโดยไม่จัดหน้าใหม่
  - **ดาวน์โหลดทั้งหมด** (หน้าคลังโน้ตเพลง) — รวมทุกเพลงเป็นไฟล์ `.zip`
- ระบบแอดมิน รหัสผ่านเดียว (ตั้งค่าใน `ADMIN_PASSWORD`) เพิ่ม/แก้ไข/ลบเพลงได้

## Environment variables

ดู `.env.example` — ตัวที่ต้องตั้งเอง:

| ตัวแปร | คำอธิบาย |
| --- | --- |
| `DATABASE_URL` | connection string ของ Postgres |
| `ADMIN_PASSWORD` | รหัสผ่านแอดมิน/ครู (ใช้ร่วมกัน) |
| `ADMIN_SESSION_SECRET` | ใช้เซ็น cookie session — สุ่มด้วย `openssl rand -base64 32` |

## Deploy ขึ้น Vercel

1. Push โค้ดขึ้น GitHub
2. Import โปรเจกต์เข้า Vercel
3. เพิ่ม Postgres (Vercel Postgres / Neon / Supabase ก็ได้) แล้วตั้ง `DATABASE_URL` ใน Environment Variables ของ Vercel
4. ตั้ง `ADMIN_PASSWORD` และ `ADMIN_SESSION_SECRET`
5. รัน migration กับฐานข้อมูล production ครั้งแรก (จากเครื่อง local ชี้ `DATABASE_URL` ไปที่ฐานข้อมูล production):
   ```bash
   npx prisma migrate deploy
   npm run seed   # ถ้าต้องการข้อมูลตัวอย่าง
   ```
6. Deploy — `next.config.mjs` ตั้ง `output: "standalone"` ไว้แล้ว ใช้ได้ทั้ง Vercel และ self-host ด้วย Docker

## คำสั่งที่ใช้บ่อย

```bash
npm run dev                 # dev server
npm run build && npm start  # production build แบบ local
npm run lint                # eslint
npm run prisma:migrate:dev  # สร้าง/อัปเดต migration ระหว่างพัฒนา
npm run prisma:migrate      # prisma migrate deploy (production)
npm run seed                # ใส่ข้อมูลตัวอย่าง
```
