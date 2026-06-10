-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateUserId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "authorEmail" TEXT,
    "authorEntityId" TEXT,
    "authorRole" TEXT,
    "relationship" TEXT,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recommendation_candidateUserId_fkey" FOREIGN KEY ("candidateUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recommendation_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Recommendation_candidateUserId_idx" ON "Recommendation"("candidateUserId");

-- CreateIndex
CREATE INDEX "Recommendation_authorUserId_idx" ON "Recommendation"("authorUserId");

-- CreateIndex
CREATE INDEX "Recommendation_status_idx" ON "Recommendation"("status");
