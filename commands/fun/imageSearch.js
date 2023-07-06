const path = require("node:path");
const { URLSearchParams } = require("node:url");
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder,
  ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
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
    let startImageIndex = shouldRandomizeResults
      ? getRandomIntInclusive(minStartIndex, maxStartIndex)
      : getPageOfImageIndex(imageIndex) * resultsPerPage;

    let searchParams = new URLSearchParams({
      "q": query,
      "searchType": searchType,
      "imgType": isAnimated ? "animated" : "imgTypeUndefined",
      "start": startImageIndex,
    });
    let requestURL = getRequestURL(googleAPIKey, searchEngineId, searchParams);

    logger.info(`Request URL: ${requestURL}`);
    let res = await request(requestURL);
    logger.info(`Response code: ${res.statusCode}`);
    let body = await res.body.json();

    if (body.searchInformation.totalResults == 0) {
      const budInvert = new AttachmentBuilder(
        path.join("..", "assets", "img", "buddyInvert.png")
      );
      const noResultEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("No results found")
        .setThumbnail("attachment://buddyInvert.png")
        .addFields({ name: "Query", value: query, inline: true });

      await interaction.reply({ embeds: [noResultsEmbed], files: [budInvert] });
    }

    let image = shouldRandomizeResults ?
      body.items[getRandomIntInclusive(0, body.items.length - 1)] :
      body.items[imageIndex % resultsPerPage];

    const resultEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle(image.title)
      .setURL(image.link)
      .setImage(image.link)
      .addFields({ name: "Query", value: query, inline: true });

    const reuseQueryBtn = new ButtonBuilder()
      .setCustomId("reuse-query")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎲");

    const buttonRow = new ActionRowBuilder()
      .addComponents(reuseQueryBtn);

    const userFilter = i => i.user.id === interaction.user.id;

    const response = await interaction.reply({ embeds: [resultEmbed], components: [buttonRow] });

    const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });

    collector.on('collect', async i => {
      if (i.customId === "reuse-query") {
        startImageIndex = getRandomIntInclusive(minStartIndex, maxStartIndex);
        searchParams.set("start", startImageIndex);
        requestURL = getRequestURL(googleAPIKey, searchEngineId, searchParams);
        logger.info(`Request URL: ${requestURL}`);
        res = await request(requestURL);
        logger.info(`Response code: ${res.statusCode}`);
        body = await res.body.json();
        image = body.items[getRandomIntInclusive(0, body.items.length - 1)];
        resultEmbed.setTitle(image.title);
        resultEmbed.setURL(image.link);
        resultEmbed.setImage(image.link);
        await i.update({ content: "Returning new random image using same query" });
        await i.followUp({ embeds: [resultEmbed], components: [buttonRow] });
      }
    });
  },
};

const getRequestURL = (googleAPIKey, searchEngineId, searchParams) => {
  return `https://www.googleapis.com/customsearch/v1?` +
    `key=${googleAPIKey}` +
    `&cx=${searchEngineId}` +
    `&${searchParams.toString()}`;
}