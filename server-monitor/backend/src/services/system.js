const si = require('systeminformation');

async function getSystemInfo() {
  const [osInfo, cpuInfo, memInfo, diskInfo] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.mem(),
    si.fsSize()
  ]);

  return {
    hostname: osInfo.hostname,
    platform: osInfo.platform,
    distro: osInfo.distro,
    release: osInfo.release,
    arch: osInfo.arch,
    cpu: {
      manufacturer: cpuInfo.manufacturer,
      brand: cpuInfo.brand,
      cores: cpuInfo.cores,
      physicalCores: cpuInfo.physicalCores
    },
    memory: {
      total: memInfo.total,
      free: memInfo.free,
      used: memInfo.used
    },
    disk: diskInfo.map(d => ({
      fs: d.fs,
      size: d.size,
      used: d.used,
      use: d.use,
      mount: d.mount
    }))
  };
}

async function getCpuUsage() {
  const currentLoad = await si.currentLoad();
  const cpuTemp = await si.cpuTemperature();

  return {
    usage: currentLoad.currentLoad,
    user: currentLoad.currentLoadUser,
    system: currentLoad.currentLoadSystem,
    idle: currentLoad.currentLoadIdle,
    temperature: cpuTemp.main || 0,
    cores: currentLoad.cpus.map(c => ({
      usage: c.load,
      user: c.loadUser,
      system: c.loadSystem
    }))
  };
}

async function getMemoryUsage() {
  const mem = await si.mem();

  return {
    total: mem.total,
    free: mem.free,
    used: mem.used,
    active: mem.active,
    available: mem.available,
    usagePercent: (mem.used / mem.total) * 100,
    swap: {
      total: mem.swaptotal,
      used: mem.swapused,
      free: mem.swapfree
    }
  };
}

async function getDiskUsage() {
  const disks = await si.fsSize();
  const blockDevices = await si.blockDevices();

  return {
    filesystems: disks.map(d => ({
      filesystem: d.fs,
      type: d.type,
      size: d.size,
      used: d.used,
      available: d.size - d.used,
      usagePercent: d.use,
      mount: d.mount
    })),
    blockDevices: blockDevices.map(b => ({
      name: b.name,
      type: b.type,
      fstype: b.fstype,
      mount: b.mount,
      size: b.size,
      physical: b.physical
    }))
  };
}

async function getNetworkStatus() {
  const interfaces = await si.networkInterfaces();
  const stats = await si.networkStats();

  return {
    interfaces: interfaces.map(i => ({
      iface: i.iface,
      ifaceName: i.ifaceName,
      ip4: i.ip4,
      ip6: i.ip6,
      mac: i.mac,
      internal: i.internal,
      virtual: i.virtual,
      operstate: i.operstate,
      type: i.type,
      speed: i.speed
    })),
    stats: stats.map(s => ({
      iface: s.iface,
      rx_bytes: s.rx_bytes,
      tx_bytes: s.tx_bytes,
      rx_sec: s.rx_sec,
      tx_sec: s.tx_sec
    }))
  };
}

module.exports = {
  getSystemInfo,
  getCpuUsage,
  getMemoryUsage,
  getDiskUsage,
  getNetworkStatus
};
