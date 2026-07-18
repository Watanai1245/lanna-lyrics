-- Drop unused Song.order (listings are sorted alphabetically now), add Section.lineBreaks
ALTER TABLE "Song" DROP COLUMN "order";
ALTER TABLE "Section" ADD COLUMN "lineBreaks" JSONB;
