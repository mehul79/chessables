/*
  Warnings:

  - You are about to drop the column `rating` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_rating_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "rating";
