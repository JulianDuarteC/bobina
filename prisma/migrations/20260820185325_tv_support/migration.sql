-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MOVIE', 'TV');

-- AlterTable
ALTER TABLE "movies_cache" ADD COLUMN     "media_type" "MediaType" NOT NULL DEFAULT 'MOVIE';
