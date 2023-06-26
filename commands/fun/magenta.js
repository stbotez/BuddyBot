const path = require("node:path");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const mm = require("@magenta/music/node/music_rnn");
const core = require("@magenta/music/node/core");
const { getRandomIntInclusive } = require(path.join(
  process.cwd(),
  "util",
  "helper.js"
));
const logger = require(path.join(process.cwd(), "util", "logger.js"));

const midiFile = fs.readFileSync(
  "D:/Programming Stuff/BuddyBot/assets/melody/battle garegga - fly to the leaden sky.mid"
);
const noteSeq = core.midiToSequenceProto(midiFile);

musicRnn = new mm.MusicRNN(
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn"
);
musicRnn.initialize();
const quantNoteSeq = core.sequences.quantizeNoteSequence(noteSeq, 1);

writeMidiToFile();

async function writeMidiToFile() {
  const contNoteSeq = await musicRnn.continueSequence(quantNoteSeq, 64, 4);
  contNoteSeq.notes.forEach((n) => (n.velocity = 100)); // magenta's midi conversion functions forget to set velocity of each note
  const newMidi = core.sequenceProtoToMidi(contNoteSeq);
  fs.writeFileSync("test.midi", newMidi);
  midiToWav("test.midi");
}

function midiToWav(midi) {
  // Pick a soundfont at random
  const outputDir = path.join(process.cwd(), "commands", "fun");
  const soundfontDir = path.join(process.cwd(), "assets", "soundfont");
  const soundfonts = fs.readdirSync(soundfontDir);
  const soundfont = soundfonts[getRandomIntInclusive(0, soundfonts.length - 1)];
  logger.info(`Currently selected soundfont is ${soundfont}`);
  const child = spawnSync("fluidsynth", [
    path.join(soundfontDir, soundfont),
    midi,
    "-F",
    path.join(outputDir, "output.wav"),
    "-r",
    "44100",
  ]);
  console.log("hi");
}
