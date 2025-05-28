const { exec } = require('child_process');

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
    else if (actionName === 'speakHello') {
        exec(`say "Hello, Sofia!"`,
            (err) => { if (err) console.error(err); }
        );
    }
    else if (actionName === 'missionControl') {
        exec(`osascript -e 'tell application "System Events" to key code 126 using control down'`,
            (err) => { if (err) console.error(err); }
        );
    }
    else if (actionName === 'swipeRight') {
        exec(`osascript -e 'tell application "System Events" to key code 124 using control down'`,
            (err) => { if (err) console.error(err) }
        );
    }
    else if (actionName === 'swipeLeft') {
        exec(`osascript -e 'tell application "System Events" to key code 123 using control down'`,
            (err) => { if (err) console.error(err) }
        );
    }
    else if (actionName === 'openMrBeast') {
        exec(`osascript -e '
        tell application "Google Chrome"
            activate
            open location "https://www.youtube.com/watch?v=DZIASl9q90s&ab_channel=MrBeast"
        end tell
        delay 2
        tell application "System Events" to keystroke "f"
    '`, (err) => { if (err) console.error(err); });
    }
    else if (actionName === 'openGoogle') {
        exec(`osascript -e '
        tell application "Google Chrome"
            activate
        end tell
    '`, (err) => { if (err) console.error(err); });
    }
    // Add more actions here
}

module.exports = {
    performAction
};
