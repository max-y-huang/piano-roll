
// include dependencies
const Tone = require("Tone");
const MidiConvert = require("MidiConvert");

// create synth
var synth = new Tone.PolySynth(10).toMaster();

// load midi data
MidiConvert.load("assets/xanadu.mid", function(midi) {

    Tone.Transport.bpm.value = midi.header.bpm;

    loadKeyMapData(midi);
    createMidiSong(midi);
});

function loadKeyMapData(midi) {

    // loop through all tracks
    for (var i = 0; i < midi.tracks.length; i++) {

        // loop through all notes
        for (var j = 0; j < midi.tracks[i].notes.length; j++) {

            var note = midi.tracks[i].notes[j];
            
            // add note to keyMap
            addKeyMapDataPoint(note.midi, note.time, note.duration);
        }
    }
}

function createMidiSong(midi) {

    // create an array to contain all notes
    var notes = [];

    for (var i = 0; i < midi.tracks.length; i++) {
        
        // concatinate all notes into a single array
        notes = notes.concat(midi.tracks[i].notes);
    }

    // add sound for each note in the current track
    var midiPart = new Tone.Part(function(time, note) {

        synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
        
    }, notes).start();
}

function playMidiSong() {

    // play and visualize midi on mouse down
    Tone.Transport.stop();
    Tone.Transport.start();
    keyboardTime = millis() / 1000;
}

// event listeners
window.addEventListener("mousedown", playMidiSong);