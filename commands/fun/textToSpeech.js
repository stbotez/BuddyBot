const path = require('node:path');
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { request } = require('undici');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Convert text into an audio file using a voice model')
        .addStringOption((option) => option
            .setName('text')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('voice')
            .setDescription('The voice to use')
            .addChoices(
                { name: 'test', value: 'test2' },
            )),

    async execute(interaction) {
    },
};
