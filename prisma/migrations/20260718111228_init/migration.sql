-- CreateEnum
CREATE TYPE "SongCategory" AS ENUM ('PHLENG', 'SAW', 'RAMWONG');

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "SongCategory" NOT NULL,
    "pageRef" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "introCells" JSONB,
    "introNote" TEXT,
    "cells" JSONB NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Song_slug_key" ON "Song"("slug");

-- CreateIndex
CREATE INDEX "Section_songId_idx" ON "Section"("songId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
