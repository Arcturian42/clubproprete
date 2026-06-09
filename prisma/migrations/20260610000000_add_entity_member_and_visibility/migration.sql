-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'private';

-- CreateTable
CREATE TABLE "EntityMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "invitedBy" TEXT,
    "invitedEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "EntityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EntityMember_userId_entityType_entityId_key" ON "EntityMember"("userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityMember_entityType_entityId_idx" ON "EntityMember"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityMember_userId_idx" ON "EntityMember"("userId");
