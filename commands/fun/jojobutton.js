const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jojobutton')
        .setDescription('Replies with buddy'),
    async execute(interaction) {
        await interaction.reply('buddy');
    },
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Jojo')
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Buddy')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(cancel, confirm);

            await interaction.reply({
                content: `EAP EAP`,
                components: [row],
            });
        },
    };