/*
  Warnings:

  - The values [DRAW] on the enum `GameResult` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameResult_new" AS ENUM ('WHITE_WINS', 'BLACK_WINS');
ALTER TABLE "Game" ALTER COLUMN "result" TYPE "GameResult_new" USING ("result"::text::"GameResult_new");
ALTER TYPE "GameResult" RENAME TO "GameResult_old";
ALTER TYPE "GameResult_new" RENAME TO "GameResult";
DROP TYPE "GameResult_old";
COMMIT;

-- AlterEnum
ALTER TYPE "GameStatus" ADD VALUE 'RESIGN';
