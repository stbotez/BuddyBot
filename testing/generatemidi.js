const fs = require('fs');
const MidiWriter = require('midi-writer-js');

// Start with a new track
const track = new MidiWriter.Track();

// Define an instrument (optional):
track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

// Add some notes:
track.addEvent([
    new MidiWriter.NoteEvent({ pitch: ['E4', 'D4'], duration: '4' }),
    new MidiWriter.NoteEvent({ pitch: ['C4'], duration: '2' }),
    new MidiWriter.NoteEvent({ pitch: ['E4', 'D4'], duration: '4' }),
    new MidiWriter.NoteEvent({ pitch: ['C4'], duration: '2' }),
    new MidiWriter.NoteEvent({ pitch: ['C4', 'C4', 'C4', 'C4', 'D4', 'D4', 'D4', 'D4'], duration: '8' }),
    new MidiWriter.NoteEvent({ pitch: ['E4', 'D4'], duration: '4' }),
    new MidiWriter.NoteEvent({ pitch: ['C4'], duration: '2' })
], function (event, index) {
    return { sequential: true };
}
);

const write = new MidiWriter.Writer(track);
fs.writeFileSync('midi.midi', write.buildFile());