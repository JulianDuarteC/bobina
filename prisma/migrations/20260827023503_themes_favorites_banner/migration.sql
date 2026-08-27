/*
  Warnings:

  - A unique constraint covering the columns `[user_id,media_type,position]` on the table `favorite_movies` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ColorTheme" ADD VALUE 'PINK';
ALTER TYPE "ColorTheme" ADD VALUE 'WHITE';
ALTER TYPE "ColorTheme" ADD VALUE 'MONO';

-- DropIndex
DROP INDEX "favorite_movies_user_id_position_key";

-- AlterTable
ALTER TABLE "favorite_movies" ADD COLUMN     "media_type" "MediaType" NOT NULL DEFAULT 'MOVIE';

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "banner_position_y" INTEGER NOT NULL DEFAULT 50;

-- CreateIndex
CREATE UNIQUE INDEX "favorite_movies_user_id_media_type_position_key" ON "favorite_movies"("user_id", "media_type", "position");
