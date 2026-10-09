-- Keep the rules that were active when a round was drawn.
ALTER TABLE "DrawRound" ADD COLUMN "ruleSnapshot" JSONB;
