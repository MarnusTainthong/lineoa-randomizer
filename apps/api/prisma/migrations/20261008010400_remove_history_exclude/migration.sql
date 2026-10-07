-- Drop "ห้ามซ้ำปีก่อน". Postgres cannot remove one enum value in place.
DELETE FROM "Rule" WHERE type = 'HISTORY_EXCLUDE';

ALTER TYPE "RuleType" RENAME TO "RuleType_old";
CREATE TYPE "RuleType" AS ENUM ('MUTUAL_EXCLUDE', 'ONE_WAY_EXCLUDE', 'GROUP_EXCLUDE', 'FORCE_ASSIGN');
ALTER TABLE "Rule" ALTER COLUMN "type" TYPE "RuleType" USING "type"::text::"RuleType";
DROP TYPE "RuleType_old";
