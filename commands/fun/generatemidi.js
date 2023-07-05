const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const MidiWriter = require("midi-writer-js");
const { getRandomIntInclusive, logger } = require("../../util/helper.js");
const { Scale } = require("tonal");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buddymusic")
    .setDescription("Experience some of the music buddy is into"),
  async execute(interaction) {
    // Randomly decide which note is the tonic
    const notes = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    const octave = "3"; // Keep it at middle C for now
    const note = notes[getRandomIntInclusive(0, notes.length - 1)] + octave;

    // Pick major or minor scale quality at random
    const scaleQuals = ["major", "minor"];
    const majOrMin = getRandomIntInclusive(0, 1);
    const scaleQual = scaleQuals[majOrMin];

    const scale = Scale.get(note + " " + scaleQual);
    logger.info(`The chosen scale is ${scale.name}`);

    const instrNum = getRandomIntInclusive(0, 127); // Randomize instrument
    const durations = ["1", "2", "d2", "4", "d4", "8", "8t", "d8", "16"];

    const track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: instrNum }));

    // Randomize number of midi notes
    const numNotes = getRandomIntInclusive(16, 48);
    logger.info(`The number of notes is ${numNotes}`);
    for (i = 0; i < numNotes; i++) {
      let randomNote =
        scale.notes[getRandomIntInclusive(0, scale.notes.length - 1)];
      let randomDuration =
        durations[getRandomIntInclusive(0, durations.length - 1)];
      track.addEvent(
        new MidiWriter.NoteEvent({
          pitch: [randomNote],
          duration: randomDuration,
        })
      );
    }

    const write = new MidiWriter.Writer(track);
    const outputDir = path.join(process.cwd(), "commands", "fun", "output");
    const midiPath = path.join(outputDir, "temp.midi");
    fs.writeFileSync(midiPath, write.buildFile());

    // Pick a soundfont at random
    const soundfontDir = path.join(process.cwd(), "assets", "soundfonts");
    const soundfonts = fs.readdirSync(soundfontDir);
    const soundfont =
      soundfonts[getRandomIntInclusive(0, soundfonts.length - 1)];
    logger.info(`Currently selected soundfont is ${soundfont}`);
    const child = spawnSync("fluidsynth", [
      path.join(soundfontDir, soundfont),
      midiPath,
      "-F",
      path.join(outputDir, "output.wav"),
      "-r",
      "44100",
    ]);

    const attachment = new AttachmentBuilder(
      path.join(outputDir, "output.wav"),
      {
        name: "the forbidden tones.wav",
      }
    );
    await interaction.reply({ files: [attachment] });
  },
};
