require('dotenv').config()

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
] });

// Dynamically read command files
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.content === 'jojo') {
    message.channel.send('buddy')
  }
});

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js'); // Retrieve the associated classes from discord.js
const { token } = require('./config.json');

// Create a new client instance. Since JavaScript isn't statically typed, the argument provided is assumed to be of type ClientOptions. The { } is also creating an object in-line.
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
] });

// Dynamically read command files
client.commands = new Collection(); // Dynamically add a new property to client called "commands" of type Collection.
const foldersPath = path.join(__dirname, 'commands'); // __dirname gives you the directory name of the current module. In this case: "D:\\Programming Stuff\\buddybot". 
													  // The join method concatanates every parameter provided into a string. As a result, we now have the directory of the "commands" folder.
const commandFolders = fs.readdirSync(foldersPath); // Read the folders in the "commands" directory (stored as string array).

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);	// Get the path of one of the folders in the "commands" folder.
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); // Return the list of files in the current command's directory as a string array, but filter them to only contain those that end in .js
																							// Use arrow function for conciseness. "file" is one of the elements from the array, passed into file.endsWith().
	for (const file of commandFiles) {	// For every file in the current command category folder
		const filePath = path.join(commandsPath, file); // Get the filepath of the current command script
		const command = require(filePath); // Load the command into "command" using the require() method
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) { // If the command is a valid one, i.e. it has "data" and "execute" fields
			client.commands.set(command.data.name, command); // Store the command as a key-value pair in client.commands (a Collection/Map object)
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('messageCreate', message => {
  if (message.content === 'jojo') {
    message.channel.send('buddy')
  }
});

client.login(token);
