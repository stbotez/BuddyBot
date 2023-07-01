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
    const index = interaction.options.getInteger("index") ?? -1;
    const searchType = "image";
    const resultsPerPage = 10;
    let startInd;
    // no user-provided index, return a random image by default
    if (index == -1) {
      startInd = getRandomIntInclusive(0, 90);
    } else {
      startInd = getPageofIndex(index) * resultsPerPage;
    }
    const res = await request(`
      https://www.googleapis.com/customsearch/v1?key=${googleAPIKey}&cx=${searchEngineId}&q=${query}&searchType=${searchType}&start=${startInd}`);
    logger.info(`User query: ${query}`);
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

    let image;
    if (index == -1) {
      image = body.items[getRandomIntInclusive(0, body.items.length - 1)];
      logger.info(
        `Randomly chosen result: ${JSON.stringify(randResult, null, 4)}`
      );
    } else {
      image = body.items[index % 10];
    }
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle(randResult.title)
      .setURL(randResult.link)
      .setImage(randResult.link)
      .addFields({ name: "Query", value: query, inline: true });
    await interaction.reply({ embeds: [embed] });
  },
};

function getPageofIndex(ind) {
  let lowerBound = 0;

  if (ind > 9) {
    lowerBound = ind - (ind % 10);
  }
  return lowerBound / 10;
}

// TODO: Probably move this function to helper class.
