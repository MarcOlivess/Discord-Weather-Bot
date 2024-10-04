const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('adding this location');
	},
};
