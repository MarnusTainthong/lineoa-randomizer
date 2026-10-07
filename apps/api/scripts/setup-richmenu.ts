import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { messagingApi } from '@line/bot-sdk';

loadDotenv({ path: ['.env', '../../.env'] });

const RICH_MENU_IMAGE_PATH = resolve(__dirname, 'richmenu.png'); // 2500x843 PNG, two halves

async function main(): Promise<void> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const liffId = process.env.VITE_LIFF_ID ?? process.env.LIFF_ID;
  if (!channelAccessToken || !liffId) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN and VITE_LIFF_ID (or LIFF_ID) are required');
  }
  if (!existsSync(RICH_MENU_IMAGE_PATH)) {
    throw new Error(`Rich menu image not found: ${RICH_MENU_IMAGE_PATH} (2500x843 PNG, two buttons)`);
  }

  const client = new messagingApi.MessagingApiClient({ channelAccessToken });
  const blobClient = new messagingApi.MessagingApiBlobClient({ channelAccessToken });

  const { richMenuId } = await client.createRichMenu({
    size: { width: 2500, height: 843 },
    selected: true,
    name: 'secret-santa-main',
    chatBarText: 'เมนู',
    areas: [
      {
        bounds: { x: 0, y: 0, width: 1250, height: 843 },
        action: { type: 'uri', label: 'ดูผลการสุ่ม', uri: `https://liff.line.me/${liffId}/results` },
      },
      {
        bounds: { x: 1250, y: 0, width: 1250, height: 843 },
        action: { type: 'uri', label: 'จัดการการสุ่ม', uri: `https://liff.line.me/${liffId}/manage` },
      },
    ],
  });

  await blobClient.setRichMenuImage(
    richMenuId,
    new Blob([readFileSync(RICH_MENU_IMAGE_PATH)], { type: 'image/png' }),
  );
  await client.setDefaultRichMenu(richMenuId);
  console.log(`Rich menu ${richMenuId} created and set as default`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
