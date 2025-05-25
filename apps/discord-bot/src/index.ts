import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅  Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', (msg) => {
  // placeholder: log message content
  console.log(`[${msg.guild?.name}] ${msg.author.tag}: ${msg.content}`);
});

client.login(process.env.BOT_TOKEN);
