-- Demandes de vérification de fiche : la fiche est publiée dès sa création,
-- la vérification (badge) est un parcours volontaire avec RDV + questionnaire.
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "yearsInBusiness" TEXT,
    "employeeCount" TEXT,
    "mainClients" TEXT,
    "additionalInfo" TEXT,
    "preferredSlot" TEXT,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VerificationRequest_entityType_entityId_idx" ON "VerificationRequest"("entityType", "entityId");

CREATE INDEX "VerificationRequest_status_idx" ON "VerificationRequest"("status");

ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Les fiches sociétés existantes en attente de modération deviennent visibles :
-- "draft" = fiche publiée non vérifiée. Les fiches déjà approuvées gardent leur badge.
UPDATE "Company" SET "verificationStatus" = 'draft' WHERE "verificationStatus" = 'pending';
