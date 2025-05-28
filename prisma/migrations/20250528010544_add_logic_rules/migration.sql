-- CreateTable
CREATE TABLE "logic_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "conditions" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "logicType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "logic_rules_entityType_idx" ON "logic_rules"("entityType");

-- CreateIndex
CREATE INDEX "logic_rules_entityId_idx" ON "logic_rules"("entityId");

-- CreateIndex
CREATE INDEX "logic_rules_isActive_idx" ON "logic_rules"("isActive");

-- CreateIndex
CREATE INDEX "logic_rules_priority_idx" ON "logic_rules"("priority");
