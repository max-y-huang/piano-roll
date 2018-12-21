
// sizing variables
var paddingBottom = 32,
    paddingLeft = 32,
    paddingRight = 32;

var keyboardWidth, keyboardHeight;
var whiteKeyWidth, whiteKeyHeight;
var blackKeyWidth, blackKeyHeight;

var secondSize;

// key variables
var keys = [];           // list of key objects
var keyMap = [];         // list of key pressed states
var keyboardTime = -1;   // time when midi starts playing (used to syncronize sketch and sound)

function setup() {

    createCanvas(windowWidth, windowHeight);

    setSizeVariables();

    createKeys();
}

function setSizeVariables() {

    keyboardWidth = width - paddingLeft - paddingRight;
    keyboardHeight = keyboardWidth / 52 * 6;
    whiteKeyWidth = keyboardWidth / 52;
    whiteKeyHeight = keyboardHeight;
    blackKeyWidth = whiteKeyWidth * 0.5;
    blackKeyHeight = whiteKeyHeight * 5 / 8;
    secondSize = (height - paddingBottom - keyboardHeight) / 4;
}

function createKeys() {

    // loop from A0 (21) to C8 (108)
    for (var i = 21; i < 109; i++) {

        var pitchId = (i - 12) % 12;                // C = 0 to B = 11. 12 comes from 12 notes in octave
        var octaveId = Math.floor((i - 12) / 12);   // 12 comes from 12 notes in octave

        var position = octaveId * 7 - 5;  // offset position by -5 => A0 and C0 -> 5 positions away. 7 notes in octave => multiply by 7
        var colour;

        // set position
        position += 0.5 * pitchId; // 2 notes in whole tone => multiply by 2
        if (pitchId > 4) {
            position += 0.5; // half-step between E and F => offset by 0.5 (no black key) after E (4)
        }

        // set colour
        // if the position is not an integer, the key is black. otherwise, it is white
        if (Math.floor(position) === position) {
            colour = "white";
        }
        else {
            colour = "black";
        }

        // add object to keys
        keys.push({ "id": i, "position": position, "colour": colour, "active": false });
    }
}

function createKeyMap() {

    // create arrays for each of the keys (indexed by key id)
    for (var i = 21; i < 109; i++) {

        keyMap[i] = new Array();
    }
}

function draw() {

    updateKeyActivity();

    background(32);
    drawIncomingNotes();
    drawKeyboard();
}

function windowResized() {

    resizeCanvas(windowWidth, windowHeight);

    setSizeVariables();
}

function drawKeyboard() {

    // order of keyboard colours to be drawn
    var keyboardColours = [ "white", "black" ];

    // loop once for white keys, once for black keys
    for (var colourCounter = 0; colourCounter < keyboardColours.length; colourCounter++) {

        // loop through all keys
        for (var i = 0; i < keys.length; i++) {

            if (keys[i].colour === keyboardColours[colourCounter]) {
                drawKey(keys[i]);
            }
        }
    }
}

function drawKey(key) {

    var yPos = height - paddingBottom - whiteKeyHeight;

    if (key.colour === "white") {

        fill(key.active ? color(0, 128, 255) : 255);
        stroke(128);
        rect(
            paddingLeft + key.position * whiteKeyWidth,
            yPos,
            whiteKeyWidth,
            whiteKeyHeight
        );
    }
    
    if (key.colour === "black") {

        fill(key.active ? color(0, 128, 255) : 0);
        stroke(128);
        rect(
            paddingLeft + key.position * whiteKeyWidth + blackKeyWidth / 2,
            yPos,
            blackKeyWidth,
            blackKeyHeight
        );
    }
}

function drawIncomingNotes() {

    // return if sketch hasn't started
    if (keyboardTime === -1) {
        return;
    }

    // get time ellapsed (in seconds)
    var time = millis() / 1000 - keyboardTime;

    // padding between the keyboard and the notes
    var keyboardPadding = 4;

    // (max) size and (max) time of incoming notes displayed
    var incomingNotesHeight = height - paddingBottom - keyboardHeight - keyboardPadding;
    var incomingNotesTime   = incomingNotesHeight / secondSize;

    // order of keyboard colours to be drawn
    var keyboardColours = [ "white", "black" ];

    // loop once for white keys, once for black keys
    for (var colourCounter = 0; colourCounter <  keyboardColours.length; colourCounter++) {
            
        // loop through all keys
        for (var i = 0; i < keys.length; i++) {

            // loop through key pressed intervals
            for (var j = 0; j < keyMap[keys[i].id].length; j++) {

                var interval = keyMap[keys[i].id][j];

                // set the starting y position (closer to keyboard) and the ending y position (further from keyboard)
                var startY = ((time + incomingNotesTime) - interval.start) * secondSize;
                var endY   = ((time + incomingNotesTime) - interval.end) * secondSize;

                // do not draw if out of visible range
                if ((startY < 0 && endY < 0) || (startY > incomingNotesHeight && endY > incomingNotesHeight)) {
                    continue;
                }

                // restrict startY to stay above keyboard
                startY = min(incomingNotesHeight, startY);

                // draw incoming note
                if (keys[i].colour === keyboardColours[colourCounter]) {

                    drawIncomingNote(keys[i], startY, endY);
                }
            }
        }
    }
}

function drawIncomingNote(key, startY, endY) {

    if (key.colour === "white") {

        stroke(32);
        fill(0, 128, 255);
        rect(
            paddingLeft + key.position * whiteKeyWidth,
            startY - (startY - endY),
            whiteKeyWidth,
            startY - endY,
            4
        ); // same as y = startY, h = -(startY - endY)
    }

    if (key.colour === "black") {

        stroke(32);
        fill(0, 128, 255);
        rect(
            paddingLeft + key.position * whiteKeyWidth + blackKeyWidth / 2,
            startY - (startY - endY),
            blackKeyWidth,
            startY - endY,
            4
        ); // same as y = startY, h = -(startY - endY)
    }
}

function updateKeyActivity() {

    // return if sketch hasn't started
    if (keyboardTime === -1) {
        return;
    }

    // get time ellapsed (in seconds)
    var time = millis() / 1000 - keyboardTime;

    // loop through all keys
    for (var i = 0; i < keys.length; i++) {

        // set active to false (default)
        keys[i].active = false;

        // loop through key pressed intervals
        for (var j = 0; j < keyMap[keys[i].id].length; j++) {

            var interval = keyMap[keys[i].id][j];

            // set active variable to true if current time is inside a pressed interval
            if (interval.start < time && interval.end > time) {
                keys[i].active = true;
            }
        }
    }
}

function addKeyMapDataPoint(id, time, duration) {

    // pushes an object containing the key pressed interval data
    keyMap[id].push({"start": time, "end": time + duration});
}