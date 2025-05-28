const { exec } = require('child_process');

//future implementation add own OPEN: and user selects app path

//===================================== ACTION FUNCTIONS =====================================//

/** Error‐logging helper */
function logError(err) {
    if (err) console.error('Action error:', err);
}

/** Action functions */
function openSpotify() {
    exec('open -a Spotify', logError);
}

function volumeDown() {
    exec(
        [
            "osascript -e 'set cur to output volume of (get volume settings)'",
            "-e 'set tgt to cur - 20'",
            "-e 'if tgt < 0 then set tgt to 0'",
            "-e 'set volume output volume tgt'"
        ].join(' '),
        logError
    );
}

function volumeUp() {
    exec(
        [
            "osascript -e 'set cur to output volume of (get volume settings)'",
            "-e 'set tgt to cur + 20'",
            "-e 'if tgt > 100 then set tgt to 100'",
            "-e 'set volume output volume tgt'"
        ].join(' '),
        logError
    );
}

function playPause() {
    exec(
        "osascript -e 'tell application \"Spotify\" to playpause'",
        logError
    );
}

function speakHello() {
    exec(`say "Hello, Sofia!"`, logError);
}

function missionControl() {
    exec(
        "osascript -e 'tell application \"System Events\" to key code 126 using control down'",
        logError
    );
}

function switchWindowRight() {
    exec(
        "osascript -e 'tell application \"System Events\" to key code 124 using control down'",
        logError
    );
}

function switchWindowLeft() {
    exec(
        "osascript -e 'tell application \"System Events\" to key code 123 using control down'",
        logError
    );
}

function openMrBeast() {
    exec(
        [
            "osascript -e 'tell application \"Google Chrome\" to activate'",
            "-e 'open location \"https://www.youtube.com/watch?v=DZIASl9q90s&ab_channel=MrBeast\"'",
            "-e 'delay 2'",
            "-e 'tell application \"System Events\" to keystroke \"f\"'"
        ].join(' '),
        logError
    );
}
function GotoYoutube() {
    exec(
        [
            "osascript -e 'tell application \"Google Chrome\" to activate'",
            "-e 'open location \"https://www.youtube.com"
        ].join(' '),
        logError
    );
}
function GotoNetflix() {
    exec(
        [
            "osascript -e 'tell application \"Google Chrome\" to activate'",
            "-e 'open location \"https://www.netflix.com/browse"
        ].join(' '),
        logError
    );
}

function openGoogle() {
    exec(
        "osascript -e 'tell application \"Google Chrome\" to activate'",
        logError
    );
}

function toggleDoNotDisturb() {
    exec(
        "defaults -currentHost write com.apple.notificationcenterui doNotDisturb -boolean " +
        "`defaults -currentHost read com.apple.notificationcenterui doNotDisturb | grep -q 1 && echo false || echo true` && " +
        "killall NotificationCenter",
        logError
    );
}

function lockScreen() {
    exec("pmset displaysleepnow", logError);
}

function takeScreenshot() {
    exec("screencapture -x ~/Desktop/screenshot_$(date +%Y%m%d_%H%M%S).png", logError);
}

function toggleMicrophoneMute() {
    exec(
        "osascript -e 'set cur to input volume of (get volume settings)' " +
        "-e 'if cur > 0 then set volume input volume 0 else set volume input volume 100 end if'",
        logError
    );
}

function showDesktop() {
    exec(
        "osascript -e 'tell application \"System Events\" to key code 103 using control down, option down'",
        logError
    );
}

function nextMedia() {
    exec("osascript -e 'tell application \"Spotify\" to next track", logError);
}

function prevMedia() {
    exec("osascript -e 'tell application \"Spotify\" to previous track", logError);
}


//===================================== LOOK-UP TABLE =====================================//

const actionHandlers = {
    'Open Spotify': openSpotify,
    'Volume Down': volumeDown,
    'Volume Up': volumeUp,
    'Play / Pause': playPause,
    'Speak Hello': speakHello,
    'Mission Control': missionControl,
    'Switch Window (Right)': switchWindowRight,
    'Switch Window (Left)': switchWindowLeft,
    'Open MrBeast': openMrBeast,
    'Open Google': openGoogle,
    'Toggle Do Not Disturb': toggleDoNotDisturb,
    'Lock Screen': lockScreen,
    'Take Screenshot': takeScreenshot,
    'Toggle Microphone Mute': toggleMicrophoneMute,
    'Show Desktop': showDesktop,
    'Next Track': nextMedia,
    'Previous Track': prevMedia,
    'Go to Netflix': GotoNetflix,
    'Go to YouTube': GotoYoutube,

    // …add more actions here…
};

//===================================== MAIN FUNCTION =====================================//

function performAction(actionName) {
    console.log(`performAction called with: ${actionName}`);
    const actionFunction = actionHandlers[actionName];
    if (actionFunction) {
        actionFunction();
    } else {
        console.warn(`No handler for action: "${actionName}"`);
    }
}

module.exports = { performAction };
