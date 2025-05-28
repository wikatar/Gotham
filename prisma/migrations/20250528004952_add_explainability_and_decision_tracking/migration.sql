-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "anomalies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "resourceId" TEXT,
    "resourceType" TEXT,
    "metadata" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "incident_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "missionId" TEXT,
    "lineageId" TEXT,
    "status" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "createdBy" TEXT,
    "readToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "incident_reports_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "incident_reports_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "anomalies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "incident_reports_lineageId_fkey" FOREIGN KEY ("lineageId") REFERENCES "lineage_logs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "decision_explanations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "decisionType" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "agentId" TEXT,
    "missionId" TEXT,
    "lineageId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "inputData" TEXT NOT NULL,
    "reasoning" TEXT,
    "alternatives" TEXT,
    "impactLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "decision_explanations_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "decision_explanations_lineageId_fkey" FOREIGN KEY ("lineageId") REFERENCES "lineage_logs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment_threads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorName" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" DATETIME,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "comments_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "comment_threads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "actorName" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lineage_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT,
    "pipelineId" TEXT,
    "agentId" TEXT,
    "missionId" TEXT,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lineage_logs_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lineage_logs_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_lineage_logs" ("agentId", "createdAt", "entityId", "id", "input", "output", "pipelineId", "source", "step") SELECT "agentId", "createdAt", "entityId", "id", "input", "output", "pipelineId", "source", "step" FROM "lineage_logs";
DROP TABLE "lineage_logs";
ALTER TABLE "new_lineage_logs" RENAME TO "lineage_logs";
CREATE INDEX "lineage_logs_entityId_idx" ON "lineage_logs"("entityId");
CREATE INDEX "lineage_logs_pipelineId_idx" ON "lineage_logs"("pipelineId");
CREATE INDEX "lineage_logs_agentId_idx" ON "lineage_logs"("agentId");
CREATE INDEX "lineage_logs_missionId_idx" ON "lineage_logs"("missionId");
CREATE INDEX "lineage_logs_step_idx" ON "lineage_logs"("step");
CREATE INDEX "lineage_logs_createdAt_idx" ON "lineage_logs"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "incident_reports_readToken_key" ON "incident_reports"("readToken");

-- CreateIndex
CREATE INDEX "decision_explanations_agentId_idx" ON "decision_explanations"("agentId");

-- CreateIndex
CREATE INDEX "decision_explanations_missionId_idx" ON "decision_explanations"("missionId");

-- CreateIndex
CREATE INDEX "decision_explanations_lineageId_idx" ON "decision_explanations"("lineageId");

-- CreateIndex
CREATE INDEX "decision_explanations_decisionType_idx" ON "decision_explanations"("decisionType");

-- CreateIndex
CREATE INDEX "decision_explanations_status_idx" ON "decision_explanations"("status");

-- CreateIndex
CREATE INDEX "decision_explanations_createdAt_idx" ON "decision_explanations"("createdAt");

-- CreateIndex
CREATE INDEX "comment_threads_entityType_entityId_idx" ON "comment_threads"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "comment_threads_entityType_entityId_key" ON "comment_threads"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "comments_threadId_idx" ON "comments"("threadId");

-- CreateIndex
CREATE INDEX "comments_createdAt_idx" ON "comments"("createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_actor_idx" ON "activity_logs"("actor");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");
