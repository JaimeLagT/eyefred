const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

let pythonProcess = null;

// in dev we need an interpreter; in prod we launch the binary directly
const isProd = process.env.NODE_ENV === 'production';
const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';

let cmd;
let args = [];

if (isProd) {
    // packaged: launch the server binary itself
    cmd = path.join(
        process.resourcesPath,
        'backend',
        process.platform === 'win32' ? 'server.exe' : 'server'
    );
} else {
    // dev: call python3 server.py
    cmd = pythonCmd;
    args = [path.join(__dirname, '..', 'backend', 'server.py')];
}

function start() {
    if (pythonProcess) return pythonProcess;

    console.log(`🔧 Launching Python backend (${isProd ? 'exe' : 'script'}) at:`, cmd, ...args);
    pythonProcess = spawn(cmd, args, { stdio: 'inherit' });

    pythonProcess.on('error', err => {
        console.error('Failed to start Python backend:', err);
        pythonProcess = null;
    });
    pythonProcess.on('exit', (code, signal) => {
        console.log(`Python backend exited (code=${code}, signal=${signal})`);
        pythonProcess = null;
    });

    return pythonProcess;
}

function stop() {
    if (pythonProcess) {
        console.log('🛑 Stopping Python backend...');
        pythonProcess.kill();       // SIGTERM
        pythonProcess = null;
    }
}

module.exports = { start, stop };
