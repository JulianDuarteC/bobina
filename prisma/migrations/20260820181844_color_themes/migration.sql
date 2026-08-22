-- CreateEnum
CREATE TYPE "ColorTheme" AS ENUM ('BOBINA', 'NOIR', 'TECHNICOLOR');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "color_theme" "ColorTheme" NOT NULL DEFAULT 'BOBINA';
