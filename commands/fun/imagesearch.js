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
    )
    .addIntegerOption((option) =>
      option
        .setName("index")
        .setDescription("Return a specific image using its index")
        .setMinValue(0)
        .setMaxValue(99)
    ),
  async execute(interaction) {
    const query = interaction.options.getString("query");
    const imageIndex = interaction.options.getInteger("index") ?? -1;
    const toggleRandomResults = imageIndex == -1 ? true : false;
    const searchType = "image";
    const resultsPerPage = 10;
    const startImageIndex = toggleRandomResults
      ? getRandomIntInclusive(0, 80)
      : getPageContainingImageIndex(imageIndex) * resultsPerPage;
    const requestURL =
      `https://www.googleapis.com/customsearch/v1?` +
      `key=${googleAPIKey}` +
      `&cx=${searchEngineId}` +
      `&q=${query}` +
      `&searchType=${searchType}` +
      `&start=${startImageIndex}`;
    logger.info(`Request URL: ${requestURL}`);
    const res = await request(requestURL);
    logger.info(`Response code: ${res.statusCode}`);
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

    const image = toggleRandomResults
      ? body.items[getRandomIntInclusive(0, body.items.length - 1)]
      : body.items[imageIndex % 10];
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle(image.title)
      .setURL(image.link)
      .setImage(image.link)
      .addFields({ name: "Query", value: query, inline: true });
    await interaction.reply({ embeds: [embed] });
  },
};

function getPageContainingImageIndex(ind) {
  let lowerBound = 0;

  if (ind > 9) {
    lowerBound = ind - (ind % 10);
  }
  return lowerBound / 10;
}

// TODO: Probably move this function to helper class.
