const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, Image } = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');
const { request } = require('undici');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('img')
		.setDescription('Hopefully returns an image'),
	async execute(interaction) {
        const canvas = createCanvas(700, 250);
		const context = canvas.getContext('2d');

		const background = await readFile('./buddy.png');
		const backgroundImage = new Image();
		backgroundImage.src = background;
		context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    
		const { body } = await request(interaction.user.displayAvatarURL({ format: 'jpg' }));
		const avatar = new Image();
		avatar.src = Buffer.from(await body.arrayBuffer());
		context.drawImage(avatar, 25, 25, 200, 200);

		const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile-image.png' });

        interaction.reply({ files: [attachment] });
	},
};