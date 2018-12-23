
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

    // set the file diplay text to the file name and load midi data
    fileInputDisplayText.innerHTML = file.name;
    loadMidiData(file);
}

function loadMidiData(file) {

    // create file reader
    var reader = new FileReader();

    reader.onload = function(e) {
        
        // get midi file
        var midi = MidiConvert.parse(e.target.result);

        songDuration = midi.duration;

        // load key map data and create midi song
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

        if (midi.tracks[i].isPercussion) {
            continue;
        }

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

        if (midi.tracks[i].isPercussion) {
            continue;
        }
        
        // concatinate all notes into a single array
        notes = notes.concat(midi.tracks[i].notes);
    }

    // add sound for each note in the current track
    var midiPart = new Tone.Part(function(time, note) {

        synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
        
    }, notes).start();
}

function playMidiSong() {

    // play and visualize midi
    Tone.Transport.stop();
    Tone.Transport.start();
    timeEllapsedShift = Tone.now().toFixed(3);
}

function stopMidiSong() {

    // stop midi song (to prevent autoplay when next song is selected)
    Tone.Transport.stop();
    timeEllapsedShift = -1;
}

// event listeners
playButton.addEventListener("click", function() {

    playMidiSong();
    inputContainer.style.display = "none";
});