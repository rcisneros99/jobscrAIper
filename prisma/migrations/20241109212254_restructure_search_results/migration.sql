/*
  Warnings:

  - You are about to drop the column `companyId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SearchHistoryToCompany` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SearchHistoryToJob` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `searchResultId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyId_fkey";

-- DropForeignKey
ALTER TABLE "_SearchHistoryToCompany" DROP CONSTRAINT "_SearchHistoryToCompany_A_fkey";

-- DropForeignKey
ALTER TABLE "_SearchHistoryToCompany" DROP CONSTRAINT "_SearchHistoryToCompany_B_fkey";

-- DropForeignKey
ALTER TABLE "_SearchHistoryToJob" DROP CONSTRAINT "_SearchHistoryToJob_A_fkey";

-- DropForeignKey
ALTER TABLE "_SearchHistoryToJob" DROP CONSTRAINT "_SearchHistoryToJob_B_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "companyId",
DROP COLUMN "updatedAt",
ADD COLUMN     "searchResultId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "_SearchHistoryToCompany";

-- DropTable
DROP TABLE "_SearchHistoryToJob";

-- CreateTable
CREATE TABLE "SearchResult" (
    "id" TEXT NOT NULL,
    "searchHistoryId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "careerPageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchResult_searchHistoryId_idx" ON "SearchResult"("searchHistoryId");

-- CreateIndex
CREATE INDEX "Job_searchResultId_idx" ON "Job"("searchResultId");

-- CreateIndex
CREATE INDEX "SavedJob_userId_idx" ON "SavedJob"("userId");

-- CreateIndex
CREATE INDEX "SavedJob_jobId_idx" ON "SavedJob"("jobId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- AddForeignKey
ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_searchHistoryId_fkey" FOREIGN KEY ("searchHistoryId") REFERENCES "SearchHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_searchResultId_fkey" FOREIGN KEY ("searchResultId") REFERENCES "SearchResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
