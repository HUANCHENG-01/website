const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function getProcessList() {
  const platform = process.platform;
  let processes = [];

  if (platform === 'win32') {
    const { stdout } = await execPromise('wmic process get ProcessId,Name,WorkingSetSize /format:csv');
    const lines = stdout.trim().split('\n').filter(line => line.trim());

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 4 && parts[2]) {
        processes.push({
          pid: parseInt(parts[3]) || 0,
          name: parts[1] || 'Unknown',
          memory: parseInt(parts[2]) || 0,
          cpu: 0
        });
      }
    }
  } else {
    const { stdout } = await execPromise('ps -eo pid,comm,%mem,%cpu --sort=-%cpu | head -50');
    const lines = stdout.trim().split('\n').slice(1);

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        processes.push({
          pid: parseInt(parts[0]) || 0,
          name: parts[1] || 'Unknown',
          memory: parseFloat(parts[2]) || 0,
          cpu: parseFloat(parts[3]) || 0
        });
      }
    }
  }

  return processes;
}

async function killProcess(pid, signal = 'SIGTERM') {
  const platform = process.platform;

  try {
    if (platform === 'win32') {
      await execPromise(`taskkill /pid ${pid} /f`);
    } else {
      const signalNum = signal === 'SIGTERM' ? 15 : 9;
      await execPromise(`kill -${signalNum} ${pid}`);
    }
    return { success: true, message: `Process ${pid} terminated` };
  } catch (error) {
    throw new Error(`Failed to kill process ${pid}: ${error.message}`);
  }
}

module.exports = {
  getProcessList,
  killProcess
};
