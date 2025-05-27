import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Events,
  GuildMember,
  Message
} from 'discord.js';
import { prisma } from './db.js';

const client = new Client({
  intents: [
    /* guild & membro */
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    /* mensagens */
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* =============== HELPERS =============== */

async function upsertGuild(id: string, name: string, ownerId?: string) {
  await prisma.guild.upsert({
    where: { id: BigInt(id) },
    update: { name },
    create: {
      id: BigInt(id),
      name,
      ownerId: BigInt(ownerId ?? '0')
    }
  });
}

async function upsertUser(id: string, username: string, avatar?: string) {
  await prisma.user.upsert({
    where: { id: BigInt(id) },
    update: { username },
    create: {
      id: BigInt(id),
      username,
      avatar
    }
  });
}

/* =============== EVENT HANDLERS =============== */

/* Bot pronto */
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot conectado como ${client.user?.tag}`);
});

/* Bot entrou num servidor */
client.on(Events.GuildCreate, async (guild) => {
  try {
    await upsertGuild(guild.id, guild.name, guild.ownerId);

    // marca o evento GUILD_JOIN
    await prisma.rawEvent.create({
      data: {
        guildId: BigInt(guild.id),
        type: 'GUILD_JOIN',
        payload: { memberCount: guild.memberCount }
      }
    });
    console.log(`🔔 Adicionado ao servidor ${guild.name}`);
  } catch (err) {
    console.error('Erro ao registrar novo servidor:', err);
  }
});

/* Novo membro entrou */
client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  try {
    await upsertUser(
      member.id,
      member.user.username,
      member.user.displayAvatarURL()
    );
    await upsertGuild(
      member.guild.id,
      member.guild.name,
      member.guild.ownerId
    );

    // adiciona/actualiza relação membro->guild
    await prisma.guildMember.upsert({
      where: {
        guildId_userId: {
          guildId: BigInt(member.guild.id),
          userId: BigInt(member.id)
        }
      },
      update: { leftAt: null },
      create: {
        guildId: BigInt(member.guild.id),
        userId: BigInt(member.id)
      }
    });

    await prisma.rawEvent.create({
      data: {
        guildId: BigInt(member.guild.id),
        userId: BigInt(member.id),
        type: 'MEMBER_JOIN',
        payload: {}
      }
    });
  } catch (err) {
    console.error('Erro ao registrar entrada de membro:', err);
  }
});

/* Membro saiu / foi expulso */
client.on(Events.GuildMemberRemove, async (member) => {
  try {
    await prisma.guildMember.updateMany({
      where: {
        guildId: BigInt(member.guild.id),
        userId: BigInt(member.id),
        leftAt: null
      },
      data: { leftAt: new Date() }
    });

    await prisma.rawEvent.create({
      data: {
        guildId: BigInt(member.guild.id),
        userId: BigInt(member.id),
        type: 'MEMBER_LEAVE',
        payload: {}
      }
    });
  } catch (err) {
    console.error('Erro ao registrar saída de membro:', err);
  }
});

/* Mensagens (já existia) */
client.on(Events.MessageCreate, async (msg: Message) => {
  if (!msg.guild || msg.author.bot) return;

  try {
    await upsertGuild(msg.guild.id, msg.guild.name, msg.guild.ownerId);
    await upsertUser(
      msg.author.id,
      msg.author.username,
      msg.author.displayAvatarURL()
    );

    await prisma.rawEvent.create({
      data: {
        guildId: BigInt(msg.guild.id),
        userId: BigInt(msg.author.id),
        type: 'MESSAGE_CREATE',
        payload: {
          channelId: msg.channel.id,
          content: msg.content.slice(0, 2000)
        }
      }
    });
  } catch (err) {
    console.error('Erro ao gravar mensagem:', err);
  }
});

/* ================== */

client.login(process.env.BOT_TOKEN);