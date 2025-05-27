// ---------- apps/discord-bot/src/index.ts ----------
import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Events,
  Message
} from 'discord.js';
import { prisma } from './db.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot conectado como ${client.user?.tag}`);
});

/** Garante que guild e user existam antes de inserir o evento */
async function ensureEntities(msg: Message) {
  await prisma.guild.upsert({
    where: { id: BigInt(msg.guild!.id) },
    update: { name: msg.guild!.name },
    create: {
      id: BigInt(msg.guild!.id),
      name: msg.guild!.name,
      ownerId: BigInt(msg.guild!.ownerId ?? '0')
    }
  });

  await prisma.user.upsert({
    where: { id: BigInt(msg.author.id) },
    update: { username: msg.author.username },
    create: {
      id: BigInt(msg.author.id),
      username: msg.author.username,
      avatar: msg.author.displayAvatarURL()
    }
  });
}

/** Handler de nova mensagem */
client.on(Events.MessageCreate, async (msg) => {
  if (!msg.guild || msg.author.bot) return;

  try {
    await ensureEntities(msg);

    await prisma.rawEvent.create({
      data: {
        guildId: BigInt(msg.guild.id),
        userId: BigInt(msg.author.id),
        type: 'MESSAGE_CREATE',
        payload: {
          channelId: msg.channel.id,
          content: msg.content.slice(0, 2000) // limite de segurança
        }
      }
    });
  } catch (err) {
    console.error('Erro ao gravar evento:', err);
  }
});

client.login(process.env.BOT_TOKEN);
/* ---------- end ---------- */