const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Sends back the weather for the current location'),
	async execute(interaction) {
		await interaction.reply('Heres the weather for today');
	},
};
