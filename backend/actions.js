const { exec } = require('child_process');
// const loudness = require('loudness');           // volume control
// const open = require('open');                   // launch apps/URLs
// const { keyboard, Key } = require("@nut-tree/nut-js"); //keybinds

function performAction(actionName) {
    console.log(`(real) performAction called with: ${actionName}`);
    if (actionName === 'playSpotify') {
        exec('open -a Spotify'); // macOS example
    } else if (actionName === 'volumeDown') {
        exec(
            "osascript -e 'set cur to output volume of (get volume settings)' " +
            "-e 'set tgt to cur - 20' " +
            "-e 'if tgt < 0 then set tgt to 0' " +
            "-e 'set volume output volume tgt'",
            (err) => { if (err) console.error(err) }
        );
    }
    else if (actionName === 'volumeUp') {
        exec("osascript -e 'set cur to output volume of (get volume settings)' " +
            "-e 'set tgt to cur + 20' " +
            "-e 'if tgt > 100 then set tgt to 100' " +
            "-e 'set volume output volume tgt'",
            (err) => { if (err) console.error(err) }
        );
    }
    else if (actionName === 'playPause') {
        exec(`osascript -e 'tell application "Spotify" to playpause'`,
            (err) => { if (err) console.error(err) }
        );

    }
    // Add more actions here
}

module.exports = {
    performAction
};
