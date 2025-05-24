const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

//decide which python command to use based on the OS
const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
//build path to server.py
const backendPath = path.join(__dirname, "..", "backend", "server.py");
//start Python backend in background
const pythonProcess = spawn(pythonCmd, [backendPath], {
    //ignore input, and pipe stdout and stderr
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
});
//whenever python script prints something print it to the terminal
pythonProcess.stdout.on('data', (data) => {
    console.log(`[Python stdout]: ${data.toString()}`);
});
//same for stderr
pythonProcess.stderr.on('data', (data) => {
    console.error(`[Python stderr]: ${data.toString()}`);
});
//if executable cant be found or something else goes wrong print this
pythonProcess.on('error', (err) => {
    console.error(`Failed to start Python server: ${err.message}`);
});
//print exit code
pythonProcess.on('exit', (code) => {
    console.log(`Python server exited with code ${code}`);
});