const { exec } = require('child_process');

module.exports = {
    performAction(actionName) {
        console.log(`(real) performAction called with: ${actionName}`);
        if (actionName === 'playSpotify') {
            exec('open -a Spotify'); // macOS example
        } else if (actionName === 'mute') {
            exec('osascript -e "set volume output muted true"');
        }
        // Add more actions here
    }
}
