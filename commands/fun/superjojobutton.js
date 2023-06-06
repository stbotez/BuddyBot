const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('superjojobutton')
        .setDescription('Takes you to a forbidden place'),
    async execute(interaction) {
        await interaction.reply('buddy');
    },
    async execute(interaction) {
        const link = new ButtonBuilder()
            .setLabel('do NOT click this')
            .setURL('https://www.youtube.com/watch?v=t1wAjcWHkDY')
            .setStyle(ButtonStyle.Link)
            .setEmoji('600064434064588813');

        const row = new ActionRowBuilder()
            .addComponents(link);

        await interaction.reply({ components: [row] })
    },
};