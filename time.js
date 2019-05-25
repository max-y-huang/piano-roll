
var timeEllapsedShift = -1;
var songDuration = -1;

// get time elapsed in seconds
function timeElapsed() {

    if (timeEllapsedShift === -1) {
        return -1;
    }

    return Tone.now().toFixed(3) - timeEllapsedShift;
}
