require('dotenv').config(); //initializes dotenv
const Discord = require('discord.js'); //imports discord.js

const client = new Discord.Client({ intents: [
  Discord.GatewayIntentBits.Guilds,
  Discord.GatewayIntentBits.GuildMessages
]})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//this line must be at the very end
client.login(process.env.CLIENT_TOKEN); //signs the bot in with token