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
		.setName('weather')
		.setDescription('Sends back the weather for the current location for the next 5 days'),
	async execute(interaction) {
		const guildId = interaction.guild.id; // Get the guild ID

		try {
			// Step 1: Connect to the MySQL database and get the location's longitude & latitude
			const connection = await mysql.createConnection({
				host: host,
				user: user,
				password:  password,
				database: database,
			});

			const query = `
				SELECT L.location_name, L.location_long, L.location_lat
				FROM Servers S
				JOIN Location L ON S.guild_id = L.guild_id
				WHERE S.guild_id = ?;
			`;
			const [rows] = await connection.execute(query, [guildId]);

			if (rows.length === 0) {
				await interaction.reply('No location is set for this server. Please use `/location` to set one.');
				return;
			}

			const { location_long: lon, location_lat: lat } = rows[0];

			// Step 2: Fetch the weather data from the OpenWeatherMap API
			const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiToken}&units=metric`;
			const weatherResponse = await axios.get(weatherApiUrl);
			const forecastData = weatherResponse.data.list;

			// Step 3: Filter the data for times where the hour is 12:00:00
			const noonForecasts = forecastData.filter(entry => entry.dt_txt.includes('12:00:00'));

			// Step 4: Format the response message with the forecast for the next 5 days
			let message = `Weather forecast for the next 5 days:\n\n`;
			noonForecasts.forEach(forecast => {
				const date = forecast.dt_txt.split(' ')[0]; // Extract the date
				const temp = forecast.main.temp-273.15; // Get the temperature
				const description = forecast.weather[0].description; // Get the weather description

				message += `📅 **${date}**: ${temp}°C, ${description}\n`;
			});

			// Close the MySQL connection
			await connection.end();

			// Step 5: Reply to the interaction with the formatted message
			await interaction.reply(message);
		} catch (error) {
			console.error('Error fetching weather data:', error);
			await interaction.reply('There was an error fetching the weather. Please try again later.');
		}
	},
}