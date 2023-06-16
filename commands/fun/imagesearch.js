const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");
const { request } = require("undici");
const { googleKey, searchEngineId } = require(path.join(
  process.cwd(),
  "config.json"
));
const logger = require(path.join(process.cwd(), "util", "logger.js"));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("img")
    .setDescription("Seek out images with the help of Buddy")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("What do you wish to see?")
        .setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString("query");
    logger.info(query);
    const searchType = "image";
    const imgResult = await request(`
      https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${searchEngineId}&q=${query}&searchType=${searchType}`);
    const { items } = await imgResult.body.json();
    const firstResult = items[0]["link"];
    await interaction.reply({ files: [firstResult] });
  },
};
