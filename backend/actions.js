const { exec } = require('child_process');
const os = require('os');
let keyboard
let Key

// Determine platform
const platform = os.platform(); // 'win32', 'darwin', 'linux'
const isWin = platform === 'win32';
const isMac = platform === 'darwin';

// For macOS, load robotjs for media keys
let robot;
if (isMac) {
    robot = require('robotjs');
}
else if (isWin) {
    const nut = require('@nut-tree-fork/nut-js')
    keyboard = nut.keyboard
    Key = nut.Key
    keyboard.config.autoDelayMs = 50;
}

/** Error‐logging helper */
function logError(err) {
    if (err) console.error('Action error:', err);
}

//===================================== ACTION FUNCTIONS =====================================//

function openSpotify() {
    if (isMac) {
        exec('open -a Spotify', logError);
    } else if (isWin) {
        exec('start "" "spotify:"', logError);
    }
}

function openEyefed() {
    if (isMac) {
        exec('open -a Eyefred', logError);
    } else if (isWin) {
        exec('start "" "Eyefred:"', logError);
    }
}

function volumeDown() {
    if (isMac) {
        exec([
            "osascript -e 'set cur to output volume of (get volume settings)'",
            "-e 'set tgt to cur - 10'",
            "-e 'if tgt < 0 then set tgt to 0'",
            "-e 'set volume output volume tgt'"
        ].join(' '), logError);
    } else if (isWin) {
        exec(
            `powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]174)"`,
            logError
        );
    }
}

function volumeUp() {
    if (isMac) {
        exec([
            "osascript -e 'set cur to output volume of (get volume settings)'",
            "-e 'set tgt to cur + 10'",
            "-e 'if tgt > 100 then set tgt to 100'",
            "-e 'set volume output volume tgt'"
        ].join(' '), logError);
    } else if (isWin) {
        exec(
            `powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]175)"`,
            logError
        );
    }
}

function playPause() {
    if (isMac) {
        robot.keyTap('audio_play');
    } else if (isWin) {
        exec(
            `powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]0xB3)"`,
            logError
        );
    }
}

function nextMedia() {
    if (isMac) {
        robot.keyTap('audio_next');
    } else if (isWin) {
        exec(
            `powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]176)"`,
            logError
        );
    }
}

function prevMedia() {
    if (isMac) {
        robot.keyTap('audio_prev');
    } else if (isWin) {
        exec(
            `powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]177)"`,
            logError
        );
    }
}

function speakHello() {
    if (isMac) {
        exec(`say "Hello, Sofia!"`, logError);
    } else if (isWin) {
        exec(
            `powershell -Command "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('Hello, Sofia!')"`,
            logError
        );
    }
}

function missionControl() {
    if (isMac) {
        exec(
            "osascript -e 'tell application \"System Events\" to key code 126 using control down'",
            logError
        );
    } else if (isWin) {
        // Windows doesn't have native mission control; omitting or use Task View
        exec(
            `powershell -Command "Start-Process explorer -ArgumentList 'shell:::{3080F90E-D7AD-11D9-BD98-0000947B0257}'"`,
            logError
        );
    }
}

function switchWindowRight() {
    if (isMac) {
        exec(
            "osascript -e 'tell application \"System Events\" to key code 124 using control down'",
            logError
        );
    } else if (isWin) {
        (async () => {
            try {
                await keyboard.pressKey(Key.LeftAlt);
                await keyboard.pressKey(Key.Tab);
                await keyboard.releaseKey(Key.Tab);
                await keyboard.releaseKey(Key.LeftAlt);
            } catch (err) {
                logError(err);
            }
        })();
    }
}

function switchWindowLeft() {
    if (isMac) {
        exec(
            "osascript -e 'tell application \"System Events\" to key code 123 using cont`rol down'",
            logError
        );
    } else if (isWin) {
        (async () => {
            try {
                await keyboard.pressKey(Key.LeftAlt);
                await keyboard.pressKey(Key.Tab);
                await keyboard.pressKey(Key.Left);
                await keyboard.releaseKey(Key.Tab);
                await keyboard.releaseKey(Key.LeftAlt);
                await keyboard.releaseKey(Key.Left);
            } catch (err) {
                logError(err);
            }
        })();
    }
}

function openGoogle() {
    if (isMac) {
        exec(
            "osascript -e 'tell application \"Google Chrome\" to activate'",
            logError
        );
    } else if (isWin) {
        exec('start "" "https://www.google.com"', logError);
    }
}

function GotoYoutube() {
    if (isMac) {
        exec([
            "osascript -e 'tell application \"Google Chrome\" to activate'",
            "-e 'open location \"https://www.youtube.com\"'"
        ].join(' '), logError);
    } else if (isWin) {
        exec('start "" "https://www.youtube.com"', logError);
    }
}

function GotoNetflix() {
    if (isMac) {
        exec([
            "osascript -e 'tell application \"Google Chrome\" to activate'",
            "-e 'open location \"https://www.netflix.com/browse\"'"
        ].join(' '), logError);
    } else if (isWin) {
        exec('start "" "https://www.netflix.com/browse"', logError);
    }
}

function openMrBeast() {
    if (isMac) {
        exec([
            "osascript -e 'tell application \"Google Chrome\" to activate'",
            "-e 'open location \"https://www.youtube.com/watch?v=DZIASl9q90s&ab_channel=MrBeast\"'",
            "-e 'delay 2'",
            "-e 'tell application \"System Events\" to keystroke \"f\"'"
        ].join(' '), logError);
    } else if (isWin) {
        exec('start "" "https://www.youtube.com/watch?v=DZIASl9q90s&ab_channel=MrBeast"', logError);
    }
}

function toggleDoNotDisturb() {
    if (isMac) {
        exec(
            "defaults -currentHost write com.apple.notificationcenterui doNotDisturb -boolean `defaults -currentHost read com.apple.notificationcenterui doNotDisturb | grep -q 1 && echo false || echo true` && killall NotificationCenter",
            logError
        );
    } else if (isWin) {
        // Windows DND toggle (Windows 10+) via action center: not directly scriptable
        console.warn('Toggle Do Not Disturb not supported on Windows');
    }
}

function lockScreen() {
    if (isMac) {
        exec('pmset displaysleepnow', logError);
    } else if (isWin) {
        exec('rundll32.exe user32.dll,LockWorkStation', logError);
    }
}

function takeScreenshot() {
    if (isMac) {
        exec("screencapture -x ~/Desktop/screenshot_$(date +%Y%m%d_%H%M%S).png", logError);
    } else if (isWin) {
        exec(
            `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $bmp = New-Object Drawing.Bitmap([Windows.Forms.Screen]::PrimaryScreen.Bounds.Width,[Windows.Forms.Screen]::PrimaryScreen.Bounds.Height); $graphics = [Drawing.Graphics]::FromImage($bmp); $graphics.CopyFromScreen(0,0,0,0,$bmp.Size); $bmp.Save([Environment]::GetFolderPath('Desktop') + '\\screenshot_' + (Get-Date -Format 'yyyyMMdd_HHmmss') + '.png');"`,
            logError
        );
    }

}

function toggleMicrophoneMute() {
    if (isMac) {
        exec([
            "osascript -e 'set cur to input volume of (get volume settings)'",
            "-e 'if cur > 0 then set volume input volume 0 else set volume input volume 100 end if'",
            "-e 'beep'"
        ].join(' '), logError);
    } else if (isWin) {
        (async () => {
            try {
                await keyboard.pressKey(Key.LeftAlt);
                await keyboard.pressKey(Key.A);
                await keyboard.releaseKey(Key.A);
                await keyboard.releaseKey(Key.LeftAlt);
            } catch (err) {
                logError(err);
            }
        })();
    }
}

function showDesktop() {
    if (isMac) {
        exec([
            "osascript -e 'tell application \"System Events\" to key code 103 using {control down, option down}'"
        ].join(' '), logError);
    } else if (isWin) {
        (async () => {
            try {
                await keyboard.pressKey(Key.LeftSuper, Key.D);
                await keyboard.releaseKey(Key.LeftSuper, Key.D);
            } catch (err) {
                logError(err);
            }
        })();
    }
}

function switchTabRight() {
    if (isMac) {
        robot.keyTap('right', ['command', 'alt']);
    } else if (isWin) {
        (async () => {
            try {
                await keyboard.pressKey(Key.LeftControl);
                // Tap Tab
                await keyboard.pressKey(Key.Tab);
                await keyboard.releaseKey(Key.Tab);
                // Release Ctrl
                await keyboard.releaseKey(Key.LeftControl);
            } catch (err) {
                logError(err);
            }
        })();
    }

}

function switchTabLeft() {
    if (isMac) {
        robot.keyTap('left', ['command', 'alt']);
    } else if (isWin) {
        (async () => {
            try {
                await keyboard.pressKey(Key.LeftControl);
                await keyboard.pressKey(Key.LeftShift);
                // Tap Tab
                await keyboard.pressKey(Key.Tab);
                await keyboard.releaseKey(Key.Tab);
                // Release Shift + Ctrl (reverse order)
                await keyboard.releaseKey(Key.LeftShift);
                await keyboard.releaseKey(Key.LeftControl);
            } catch (err) {
                logError(err);
            }
        })();
    }

}

//===================================== LOOK-UP TABLE =====================================//
const actionHandlers = {
    'Open Spotify': openSpotify,
    'Volume Down': volumeDown,
    'Volume Up': volumeUp,
    'Play / Pause': playPause,
    'Next Track': nextMedia,
    'Previous Track': prevMedia,
    'Speak Hello': speakHello,
    'Mission Control': missionControl,
    'Switch Window (Right)': switchWindowRight,
    'Switch Window (Left)': switchWindowLeft,
    'Open Google': openGoogle,
    'Go to YouTube': GotoYoutube,
    'Go to Netflix': GotoNetflix,
    'Open MrBeast': openMrBeast,
    'Toggle Do Not Disturb': toggleDoNotDisturb,
    'Lock Screen': lockScreen,
    'Take Screenshot': takeScreenshot,
    'Toggle Microphone Mute': toggleMicrophoneMute,
    'Show Desktop': showDesktop,
    'Open Eyefred': openEyefed,
    'Switch Tab (Left)': switchTabLeft,
    'Switch Tab (Right)': switchTabRight,
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
