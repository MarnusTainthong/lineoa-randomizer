-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('OPEN', 'DRAWN', 'CLOSED');

-- CreateEnum
CREATE TYPE "Feasibility" AS ENUM ('OK', 'INFEASIBLE', 'TOO_FEW_PARTICIPANTS');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('MUTUAL_EXCLUDE', 'ONE_WAY_EXCLUDE', 'GROUP_EXCLUDE', 'HISTORY_EXCLUDE', 'FORCE_ASSIGN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "lineUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "pictureUrl" TEXT,
    "isMockUser" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "budget" INTEGER,
    "exchangeDate" TIMESTAMP(3),
    "inviteCode" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'OPEN',
    "organizerId" TEXT NOT NULL,
    "allowViewAllResults" BOOLEAN NOT NULL DEFAULT false,
    "feasibility" "Feasibility" NOT NULL DEFAULT 'TOO_FEW_PARTICIPANTS',
    "feasibilityReason" TEXT,
    "currentDrawVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "addedById" TEXT,
    "lastSeenDrawVersion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" "RuleType" NOT NULL,
    "participantIds" TEXT[],
    "note" TEXT,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawRound" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "drawnById" TEXT NOT NULL,
    "drawnAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrawRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "drawVersion" INTEGER NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_lineUserId_key" ON "User"("lineUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_inviteCode_key" ON "Event"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_eventId_userId_key" ON "Participant"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DrawRound_eventId_version_key" ON "DrawRound"("eventId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_eventId_giverId_drawVersion_key" ON "Assignment"("eventId", "giverId", "drawVersion");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_eventId_receiverId_drawVersion_key" ON "Assignment"("eventId", "receiverId", "drawVersion");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawRound" ADD CONSTRAINT "DrawRound_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
