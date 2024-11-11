/*
  Warnings:

  - Made the column `location` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `applicationUrl` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Job_searchResultId_idx";

-- DropIndex
DROP INDEX "SearchHistory_userId_idx";

-- DropIndex
DROP INDEX "SearchResult_searchHistoryId_idx";

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "applicationUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "SearchHistory" ALTER COLUMN "resultsCount" DROP DEFAULT;
