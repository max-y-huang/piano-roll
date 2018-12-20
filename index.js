
// include dependencies
const Tone = require("Tone");
const MidiConvert = require("MidiConvert");

// set DOM objects
const inputContainer       = document.querySelector("#input-container");
const fileInputDisplayText = document.querySelector("#file-input-display-text");
const playButton           = document.querySelector("#play-button");

// create synth
var synth = new Tone.PolySynth(10).toMaster();

function selectMidiSong(file) {

    fileInputDisplayText.innerHTML = file.name;
    loadMidiData(file);
}

function loadMidiData(file) {

    var reader = new FileReader();

    reader.onload = function(e) {
        
        var midi = MidiConvert.parse(e.target.result);

        loadKeyMapData(midi);
        createMidiSong(midi);
    };

    reader.readAsBinaryString(file);
}

function loadKeyMapData(midi) {

    // recreate the key map for the sketch
    createKeyMap();

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

    // remove all previous saved information
    Tone.Transport.cancel();

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
playButton.addEventListener("click", function() {

    playMidiSong();
    inputContainer.style.display = "none";
});