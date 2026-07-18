-- Drop unused pageRef, add Song.note, and add per-section freeText / color-override columns
ALTER TABLE "Song" DROP COLUMN "pageRef";
ALTER TABLE "Song" ADD COLUMN "note" TEXT;

ALTER TABLE "Section" ADD COLUMN "introColors" JSONB;
ALTER TABLE "Section" ADD COLUMN "cellColors" JSONB;
ALTER TABLE "Section" ADD COLUMN "freeText" TEXT;
