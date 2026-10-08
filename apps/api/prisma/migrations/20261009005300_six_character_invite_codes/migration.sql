-- Older rooms used an 8-character code. Every room code is now 6 letters or digits.
UPDATE "Event"
SET "inviteCode" = 'DEMO01'
WHERE "inviteCode" = 'DEMO1234'
  AND NOT EXISTS (SELECT 1 FROM "Event" WHERE "inviteCode" = 'DEMO01');

DO $$
DECLARE
  room record;
  alphabet text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  next_code text;
  attempt int;
  index int;
BEGIN
  FOR room IN SELECT id FROM "Event" WHERE "inviteCode" !~ '^[A-Z0-9]{6}$' LOOP
    attempt := 0;
    LOOP
      next_code := '';
      FOR index IN 1..6 LOOP
        next_code := next_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Event" WHERE "inviteCode" = next_code);
      attempt := attempt + 1;
      IF attempt > 20 THEN
        RAISE EXCEPTION 'could not allocate invite code';
      END IF;
    END LOOP;
    UPDATE "Event" SET "inviteCode" = next_code WHERE id = room.id;
  END LOOP;
END $$;
