const path = require("node:path");
const fs = require("node:fs");
const mm = require("@magenta/music/node/music_rnn");
const core = require("@magenta/music/node/core");

const midiFile = fs.readFileSync(
  "D:/Programming Stuff/BuddyBot/assets/melody/battle garegga - fly to the leaden sky.mid"
);

const noteSeq = core.midiToSequenceProto(midiFile);

musicRnn = new mm.MusicRNN(
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn"
);
musicRnn.initialize();
const quantNoteSeq = core.sequences.quantizeNoteSequence(noteSeq, 2);

async function writeMidiToFile() {
  const contNoteSeq = await musicRnn.continueSequence(quantNoteSeq, 32, 1);
  contNoteSeq.notes.forEach((n) => (n.velocity = 100));
  const newMidi = core.sequenceProtoToMidi(contNoteSeq);
  fs.writeFileSync("test.midi", newMidi);
}

writeMidiToFile();
