import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above with WhatsApp to authenticate.');
});

client.on('ready', () => {
  console.log('WhatsApp bot is ready!');
});

client.on('message', async (msg) => {
  if (msg.body === '/tasks') {
    // TODO: Integrate with Supabase to fetch user tasks
    await msg.reply('You have 3 upcoming tasks. (Demo)');
  } else if (msg.body === '/summary') {
    // TODO: Integrate with inbox summary
    await msg.reply('Inbox summary: 2 new booking requests. (Demo)');
  } else if (msg.body === '/status') {
    await msg.reply('AuraManager bot is online!');
  }
});

client.initialize();
