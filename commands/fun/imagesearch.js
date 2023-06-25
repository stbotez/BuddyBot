const path = require("node:path");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { request } = require("undici");
const { googleAPIKey, searchEngineId } = require(path.join(
  process.cwd(),
  "config.json"
));
const { getRandomIntInclusive } = require(path.join(
  process.cwd(),
  "util",
  "helper.js"
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
    logger.info(`User query provided: ${query}`);
    const searchType = "image";
    const imgResult = await request(`
      https://www.googleapis.com/customsearch/v1?key=${googleAPIKey}&cx=${searchEngineId}&q=${query}&searchType=${searchType}`);
    const { items } = await imgResult.body.json();
    const randResult = items[getRandomIntInclusive(0, items.length - 1)];
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle(randResult["title"])
      .setURL(randResult["link"])
      .setImage(randResult["link"])
      .addFields({ name: "Query", value: query, inline: true });
    await interaction.reply({ embeds: [embed] });
  },
};
