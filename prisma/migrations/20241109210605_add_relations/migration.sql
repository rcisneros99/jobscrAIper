/*
  Warnings:

  - You are about to drop the `_CompanyToSearchHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_JobToSearchHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CompanyToSearchHistory" DROP CONSTRAINT "_CompanyToSearchHistory_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompanyToSearchHistory" DROP CONSTRAINT "_CompanyToSearchHistory_B_fkey";

-- DropForeignKey
ALTER TABLE "_JobToSearchHistory" DROP CONSTRAINT "_JobToSearchHistory_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobToSearchHistory" DROP CONSTRAINT "_JobToSearchHistory_B_fkey";

-- AlterTable
ALTER TABLE "SearchHistory" ADD COLUMN     "resultsCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "_CompanyToSearchHistory";

-- DropTable
DROP TABLE "_JobToSearchHistory";

-- CreateTable
CREATE TABLE "_SearchHistoryToCompany" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SearchHistoryToJob" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SearchHistoryToCompany_AB_unique" ON "_SearchHistoryToCompany"("A", "B");

-- CreateIndex
CREATE INDEX "_SearchHistoryToCompany_B_index" ON "_SearchHistoryToCompany"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SearchHistoryToJob_AB_unique" ON "_SearchHistoryToJob"("A", "B");

-- CreateIndex
CREATE INDEX "_SearchHistoryToJob_B_index" ON "_SearchHistoryToJob"("B");

-- AddForeignKey
ALTER TABLE "_SearchHistoryToCompany" ADD CONSTRAINT "_SearchHistoryToCompany_A_fkey" FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SearchHistoryToCompany" ADD CONSTRAINT "_SearchHistoryToCompany_B_fkey" FOREIGN KEY ("B") REFERENCES "SearchHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SearchHistoryToJob" ADD CONSTRAINT "_SearchHistoryToJob_A_fkey" FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SearchHistoryToJob" ADD CONSTRAINT "_SearchHistoryToJob_B_fkey" FOREIGN KEY ("B") REFERENCES "SearchHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
