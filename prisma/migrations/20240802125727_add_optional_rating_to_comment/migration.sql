-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "rating" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "ratings" JSONB;
