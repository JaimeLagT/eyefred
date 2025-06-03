const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const treeKill = require('tree-kill');

let pythonProcess = null;

// Check if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);

const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';

function start() {
    let cmd;
    let args = [];
    let options = {};

    if (isDev) {
        // Development: call python interpreter with script
        cmd = pythonCmd;
        args = [path.join(__dirname, '..', 'backend', 'server.py')];
        console.log('Dev mode: Running Python script with interpreter');
    } else {
        // Production: launch the packaged binary
        const exeName = process.platform === 'win32' ? 'server.exe' : 'server';

        // Production: launch the packaged binary
        cmd = path.join(process.resourcesPath, 'backend', 'dist', exeName);
        console.log(`Production mode: Running executable at ${cmd}`);

        // Set working directory to the executable's directory
        options.cwd = path.dirname(cmd);
    }

    console.log(`Starting Python process: ${cmd} ${args.join(' ')}`);

    try {
        pythonProcess = spawn(cmd, args, {
            ...options,
            stdio: ['pipe', 'pipe', 'pipe'], // Capture stdout/stderr
            detached: false,
            shell: false
        });

        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python stdout: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
            pythonProcess = null;
        });

        pythonProcess.on('error', (error) => {
            console.error('Failed to start Python process:', error);
            pythonProcess = null;
        });

        console.log(`Python process started with PID: ${pythonProcess.pid}`);

    } catch (error) {
        console.error('Error spawning Python process:', error);
    }
}


//TODO: TRY THIS TMR:
function stop() {
    return new Promise((res, rej) => {
        if (!pythonProcess) return res() // nothing to kill
        const pid = pythonProcess.pid;
        console.log(`Attempting to kill server with PID ${pythonProcess.pid}`);

        //wait until the child is really closed
        const finished = () => {
            pythonProcess = null;
            console.log(`✓ Python ${pid} stopped`);
            res();
        };
        //once the python process is closed
        pythonProcess.once('close', finished);
        //kill the tree
        treeKill(pythonProcess.pid, 'SIGTERM', (err) => {
            if (err) {
                console.error('Failed to kill process tree:', err);
                rej(err);
            } else {
                console.log('Successfully killed process tree.');
            }
        });
    })
}

module.exports = {
    start,
    stop
};