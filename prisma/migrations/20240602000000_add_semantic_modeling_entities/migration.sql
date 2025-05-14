-- CreateTable
CREATE TABLE "EntityType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityFieldMap" (
    "id" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "cleanedFieldName" TEXT NOT NULL,
    "semanticName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityFieldMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityRelation" (
    "id" TEXT NOT NULL,
    "fromEntityTypeId" TEXT NOT NULL,
    "toEntityTypeId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EntityFieldMap_entityTypeId_idx" ON "EntityFieldMap"("entityTypeId");

-- CreateIndex
CREATE INDEX "EntityFieldMap_cleanedFieldName_idx" ON "EntityFieldMap"("cleanedFieldName");

-- CreateIndex
CREATE INDEX "EntityRelation_fromEntityTypeId_idx" ON "EntityRelation"("fromEntityTypeId");

-- CreateIndex
CREATE INDEX "EntityRelation_toEntityTypeId_idx" ON "EntityRelation"("toEntityTypeId");

-- CreateIndex
CREATE INDEX "EntityRelation_relationType_idx" ON "EntityRelation"("relationType");

-- AddForeignKey
ALTER TABLE "EntityFieldMap" ADD CONSTRAINT "EntityFieldMap_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityRelation" ADD CONSTRAINT "EntityRelation_fromEntityTypeId_fkey" FOREIGN KEY ("fromEntityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityRelation" ADD CONSTRAINT "EntityRelation_toEntityTypeId_fkey" FOREIGN KEY ("toEntityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 