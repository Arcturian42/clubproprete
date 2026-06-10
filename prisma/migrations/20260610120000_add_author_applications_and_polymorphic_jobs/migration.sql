-- Rebuild Job so suppliers can publish offers without creating a fake company.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT,
    "employerType" TEXT NOT NULL DEFAULT 'company',
    "employerEntityId" TEXT,
    "createdBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "workingTime" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "startDate" DATETIME,
    "requiredSkills" TEXT,
    "requiredExperience" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Job_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Job" (
    "id",
    "companyId",
    "employerType",
    "employerEntityId",
    "createdBy",
    "title",
    "description",
    "contractType",
    "workingTime",
    "city",
    "postalCode",
    "salaryMin",
    "salaryMax",
    "startDate",
    "requiredSkills",
    "requiredExperience",
    "status",
    "publishedAt",
    "expiresAt",
    "createdAt",
    "updatedAt",
    "deletedAt"
)
SELECT
    "id",
    "companyId",
    'company',
    "companyId",
    "createdBy",
    "title",
    "description",
    "contractType",
    "workingTime",
    "city",
    "postalCode",
    "salaryMin",
    "salaryMax",
    "startDate",
    "requiredSkills",
    "requiredExperience",
    "status",
    "publishedAt",
    "expiresAt",
    "createdAt",
    "updatedAt",
    "deletedAt"
FROM "Job";

DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";

CREATE INDEX "Job_employerType_employerEntityId_idx" ON "Job"("employerType", "employerEntityId");
CREATE INDEX "Job_createdBy_idx" ON "Job"("createdBy");

PRAGMA foreign_keys=ON;

-- Author access requests. The first proposed article is kept as a normal Article
-- and gets published automatically when the application is approved.
CREATE TABLE "AuthorApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "articleId" TEXT,
    "motivation" TEXT,
    "expertise" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AuthorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuthorApplication_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AuthorApplication_articleId_key" ON "AuthorApplication"("articleId");
CREATE INDEX "AuthorApplication_userId_idx" ON "AuthorApplication"("userId");
CREATE INDEX "AuthorApplication_status_idx" ON "AuthorApplication"("status");
