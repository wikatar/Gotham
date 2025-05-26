-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "lineage_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT,
    "pipelineId" TEXT,
    "agentId" TEXT,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lineage_logs_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "entities_type_externalId_key" ON "entities"("type", "externalId");

-- CreateIndex
CREATE INDEX "entities_type_idx" ON "entities"("type");

-- CreateIndex
CREATE INDEX "lineage_logs_entityId_idx" ON "lineage_logs"("entityId");

-- CreateIndex
CREATE INDEX "lineage_logs_pipelineId_idx" ON "lineage_logs"("pipelineId");

-- CreateIndex
CREATE INDEX "lineage_logs_agentId_idx" ON "lineage_logs"("agentId");

-- CreateIndex
CREATE INDEX "lineage_logs_step_idx" ON "lineage_logs"("step");

-- CreateIndex
CREATE INDEX "lineage_logs_createdAt_idx" ON "lineage_logs"("createdAt"); 