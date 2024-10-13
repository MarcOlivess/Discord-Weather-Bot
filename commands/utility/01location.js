const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const mysql = require('mysql2/promise');

const { host } = require('./config.json');
const { user } = require('./config.json');
const { password } = require('./config.json');
const { database } = require('./config.json');
const { apiToken } = require('./config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('location')
		.setDescription('Takes in user location for storage')
		.addStringOption(option =>
			option.setName('city')
				.setDescription('City name')
				.setRequired(true)),
  


	async execute(interaction) {
		//command start


		const city = interaction.options.getString('city');
		const guildId = interaction.guild.id; 

		const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiToken}`;

		try {
			// Step 1: Make an API request to get location data
			const response = await axios.get(apiUrl);
			const locationData = response.data; 

		

			
			const location = locationData.current_location;

			// Step 2: Connect to the MySQL database
			const connection = await mysql.createConnection({
				host: host, 
				user: user,
				password: password, 
				database: database 
			});

			// Step 3: Insert the location data into the database
			const insertQuery = `
				INSERT INTO Servers (guild_id, current_location) 
				VALUES (?, ?) 
				ON DUPLICATE KEY UPDATE current_location = ?;
			`;

			
			await connection.execute(insertQuery, [guildId, location, location]);

			// Close the database connection
			await connection.end();

			// Respond to the user in the Discord chat
			await interaction.reply(`Setting this as your location: ${location}`);




			
		} catch (error) {
			console.error('Error setting location:', error);
			await interaction.reply('There was an error setting your location. Please try again later.');
		}
	},
};