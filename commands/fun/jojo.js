const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jojo")
    .setDescription("Replies with buddy"),
  async execute(interaction) {
    await interaction.reply("buddy");
  },
};
