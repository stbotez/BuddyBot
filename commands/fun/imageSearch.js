const path = require("node:path");
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder,
  ButtonStyle, ActionRowBuilder } = require("discord.js");
const { request } = require("undici");
const { googleAPIKey, searchEngineId } = require("../../config.json");
const { getRandomIntInclusive, getPageOfImageIndex, logger } =
  require("../../util/helper.js");

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
    )
    .addBooleanOption((option) =>
      option.setName("is-animated").setDescription("Return only animated images")
    ),

  async execute(interaction) {
    const query = interaction.options.getString("query");
    const imageIndex = interaction.options.getInteger("index") ?? -1;
    const isAnimated = interaction.options.getBoolean("is-animated") ?? false;
    const shouldRandomizeResults = imageIndex == -1 ? true : false;
    const searchType = "image";
    const resultsPerPage = 10;
    const minStartIndex = 0;
    const maxStartIndex = 80;
    const startImageIndex = shouldRandomizeResults
      ? getRandomIntInclusive(minStartIndex, maxStartIndex)
      : getPageOfImageIndex(imageIndex) * resultsPerPage;
    logger.info(`${startImageIndex}`);

    const requestURL =
      `https://www.googleapis.com/customsearch/v1?` +
      `key=${googleAPIKey}` +
      `&cx=${searchEngineId}` +
      `&q=${query}` +
      `&searchType=${searchType}` +
      `&imgType=${isAnimated ? "animated" : "imgTypeUndefined"}` +
      `&start=${startImageIndex}`;
    logger.info(`Request URL: ${requestURL}`);
    const res = await request(requestURL);
    logger.info(`Response code: ${res.statusCode}`);
    const body = await res.body.json();

    if (body.searchInformation.totalResults == 0) {
      const budInvert = new AttachmentBuilder(
        path.join("..", "assets", "img", "buddyInvert.png")
      );
      const noResultsEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("No results found")
        .setThumbnail("attachment://buddyInvert.png")
        .addFields({ name: "Query", value: query, inline: true });

      await interaction.reply({ embeds: [noResultsEmbed], files: [budInvert] });
    }

    const image = shouldRandomizeResults
      ? body.items[getRandomIntInclusive(0, body.items.length - 1)]
      : body.items[imageIndex % resultsPerPage];

    const reuseQueryBtn = new ButtonBuilder()
      .setCustomId("primary")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎲");

    const buttonRow = new ActionRowBuilder()
      .addComponents(reuseQueryBtn);

    const resultEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle(image.title)
      .setURL(image.link)
      .setImage(image.link)
      .addFields({ name: "Query", value: query, inline: true });

    await interaction.reply({ embeds: [resultEmbed], components: [buttonRow] });
  },
};
