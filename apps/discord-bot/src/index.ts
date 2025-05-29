// apps/discord-bot/src/index.ts
import "dotenv/config";
import {
  Client,
  Events,
  GatewayIntentBits,
  Guild,
  GuildMember,
  Message
} from "discord.js";
import { prisma } from "./db.js";

/* ───────────────────────── HELPERS ───────────────────────── */

async function upsertGuild(guild: Guild) {
  await prisma.guild.upsert({
    where: { id: BigInt(guild.id) },
    update: { name: guild.name, ownerId: BigInt(guild.ownerId ?? "0") },
    create: {
      id: BigInt(guild.id),
      name: guild.name,
      ownerId: BigInt(guild.ownerId ?? "0")
    }
  });
}

async function upsertUser(member: GuildMember) {
  const { user } = member;
  await prisma.user.upsert({
    where: { id: BigInt(user.id) },
    update: { username: user.username, avatar: user.displayAvatarURL() },
    create: {
      id: BigInt(user.id),
      username: user.username,
      avatar: user.displayAvatarURL()
    }
  });
}

async function createMemberRow(member: GuildMember) {
  await prisma.guildMember.upsert({
    where: {
      guildId_userId: {
        guildId: BigInt(member.guild.id),
        userId: BigInt(member.id)
      }
    },
    update: { leftAt: null }, // caso tenha saído e voltado
    create: {
      guildId: BigInt(member.guild.id),
      userId: BigInt(member.id)
    }
  });
}

async function markMemberLeft(member: GuildMember) {
  await prisma.guildMember.updateMany({
    where: {
      guildId: BigInt(member.guild.id),
      userId: BigInt(member.id),
      leftAt: null
    },
    data: { leftAt: new Date() }
  });
}

async function logRawEvent(
  guildId: string,
  type: "MESSAGE_CREATE" | "MEMBER_JOIN" | "MEMBER_LEAVE",
  payload: unknown,
  userId?: string
) {
  await prisma.rawEvent.create({
    data: {
      guildId: BigInt(guildId),
      userId: userId ? BigInt(userId) : null,
      type,
      payload
    }
  });
}

/* ───────────────────────── BOT CLIENT ───────────────────────── */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* Bot conectado */
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot conectado como ${client.user?.tag}`);
});

/* ── 1. Bot entrou em um novo servidor ─────────────────────── */
client.on(Events.GuildCreate, async (guild) => {
  try {
    await upsertGuild(guild);

    // salva membros atuais para não depender só de eventos futuros
    const members = await guild.members.fetch();
    for (const member of members.values()) {
      if (member.user.bot) continue;
      await upsertUser(member);
      await createMemberRow(member);
    }

    console.log(`➕ Registrado novo servidor: ${guild.name}`);
  } catch (err) {
    console.error("Erro ao processar GuildCreate:", err);
  }
});

/* ── 2. Membro entrou ──────────────────────────────────────── */
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    await upsertGuild(member.guild);
    await upsertUser(member);
    await createMemberRow(member);

    await logRawEvent(member.guild.id, "MEMBER_JOIN", {}, member.id);
  } catch (err) {
    console.error("Erro ao processar GuildMemberAdd:", err);
  }
});

/* ── 3. Membro saiu ─────────────────────────────────────────── */
client.on(Events.GuildMemberRemove, async (member) => {
  if (member.user?.bot) return;

  try {
    await upsertGuild(member.guild);
    await upsertUser(member as GuildMember);
    await markMemberLeft(member as GuildMember);

    await logRawEvent(member.guild.id, "MEMBER_LEAVE", {}, member.id);
  } catch (err) {
    console.error("Erro ao processar GuildMemberRemove:", err);
  }
});

/* ── 4. Nova mensagem ──────────────────────────────────────── */
client.on(Events.MessageCreate, async (msg: Message) => {
  if (!msg.guild || msg.author.bot) return;

  try {
    const member = await msg.member!.fetch();

    await upsertGuild(msg.guild);
    await upsertUser(member);
    await createMemberRow(member); // garante que exista

    await logRawEvent(
      msg.guild.id,
      "MESSAGE_CREATE",
      {
        channelId: msg.channel.id,
        content: msg.content.slice(0, 2000)
      },
      msg.author.id
    );
  } catch (err) {
    console.error("Erro ao gravar mensagem:", err);
  }
});

/* ── Login ─────────────────────────────────────────────────── */
client.login(process.env.BOT_TOKEN);