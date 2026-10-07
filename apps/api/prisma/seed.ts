import { PrismaClient } from '@prisma/client';
import { RULE_TYPE } from '@secret-santa/shared';
import { checkFeasibility } from '../src/modules/draw/engine';

const prisma = new PrismaClient();

const MOCK_NAMES = [
  'สมชาย', 'มาลี', 'ปอ', 'นิดา', 'ธนากร', 'พิมพ์ชนก', 'ประเสริฐ', 'วิภา', 'กิตติ', 'อรทัย',
];

async function main(): Promise<void> {
  const users = [];
  for (const [index, displayName] of MOCK_NAMES.entries()) {
    users.push(
      await prisma.user.upsert({
        where: { lineUserId: `mock:seed-${index}` },
        create: { lineUserId: `mock:seed-${index}`, displayName, isMockUser: true },
        update: { displayName },
      }),
    );
  }
  const [organizer] = users;
  if (!organizer) throw new Error('seed users missing');

  await prisma.auditLog.deleteMany({ where: { eventId: { in: (await prisma.event.findMany({ where: { inviteCode: 'DEMO1234' } })).map((event) => event.id) } } });
  await prisma.event.deleteMany({ where: { inviteCode: 'DEMO1234' } });

  const event = await prisma.event.create({
    data: {
      name: 'ปีใหม่ ออฟฟิศ',
      description: 'แลกของขวัญงานเลี้ยงสิ้นปี',
      budget: 500,
      inviteCode: 'DEMO1234',
      organizerId: organizer.id,
      participants: {
        create: users.map((user) => ({ userId: user.id, displayName: user.displayName })),
      },
    },
    include: { participants: true },
  });

  const idByName = new Map(event.participants.map((participant) => [participant.displayName, participant.id]));
  const idsOf = (...names: string[]) => names.map((name) => idByName.get(name) as string);

  await prisma.rule.createMany({
    data: [
      { eventId: event.id, type: RULE_TYPE.MUTUAL_EXCLUDE, participantIds: idsOf('สมชาย', 'มาลี'), note: 'คู่รัก' },
      { eventId: event.id, type: RULE_TYPE.GROUP_EXCLUDE, participantIds: idsOf('ธนากร', 'พิมพ์ชนก', 'ประเสริฐ'), note: 'ครอบครัวเดียวกัน' },
    ],
  });

  const rules = await prisma.rule.findMany({ where: { eventId: event.id } });
  const check = checkFeasibility(event.participants, rules);
  await prisma.event.update({
    where: { id: event.id },
    data: { feasibility: check.feasibility, feasibilityReason: check.reason },
  });

  console.log(`Seeded room "${event.name}" (invite code DEMO1234) with ${users.length} mock users`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
