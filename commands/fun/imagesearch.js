const path = require("node:path");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
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
    logger.info(`User query: ${query}`);
    const searchType = "image";
    const startInd = getRandomIntInclusive(0, 80);
    const res = await request(`
      https://www.googleapis.com/customsearch/v1?key=${googleAPIKey}&cx=${searchEngineId}&q=${query}&searchType=${searchType}&start=${startInd}`);
    logger.info("Header: ");
    logger.info(res.headers);
    const body = await res.body.json();
    if (body.searchInformation.totalResults == 0) {
      const budInvert = new AttachmentBuilder(
        path.join(process.cwd(), "assets", "img", "buddyInvert.png")
      );
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("No results found")
        .setThumbnail("attachment://buddyInvert.png")
        .addFields({ name: "Query", value: query, inline: true });

      await interaction.reply({ embeds: [embed], files: [budInvert] });
    }

    const randResult =
      body.items[getRandomIntInclusive(0, body.items.length - 1)];
    logger.info(
      `Randomly chosen result: ${JSON.stringify(randResult, null, 4)}`
    );
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle(randResult.title)
      .setURL(randResult.link)
      .setImage(randResult.link)
      .addFields({ name: "Query", value: query, inline: true });
    await interaction.reply({ embeds: [embed] });
  },
};
