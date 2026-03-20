const Docker = require('dockerode');

let docker;
try {
  docker = new Docker();
} catch (error) {
  console.warn('Docker not available:', error.message);
}

async function getContainerList(all = true) {
  if (!docker) {
    return { error: 'Docker is not available', containers: [] };
  }

  try {
    const containers = await docker.listContainers({ all });

    return {
      containers: containers.map(c => ({
        id: c.Id,
        name: c.Names[0]?.replace('/', '') || 'unknown',
        image: c.Image,
        status: c.Status,
        state: c.State,
        ports: c.Ports.map(p => ({
          ip: p.IP || '',
          privatePort: p.PrivatePort,
          publicPort: p.PublicPort || null,
          type: p.Type
        })),
        created: c.Created
      }))
    };
  } catch (error) {
    return { error: error.message, containers: [] };
  }
}

async function startContainer(containerId) {
  if (!docker) {
    throw new Error('Docker is not available');
  }

  const container = docker.getContainer(containerId);
  await container.start();
  return { success: true, message: `Container ${containerId} started` };
}

async function stopContainer(containerId) {
  if (!docker) {
    throw new Error('Docker is not available');
  }

  const container = docker.getContainer(containerId);
  await container.stop();
  return { success: true, message: `Container ${containerId} stopped` };
}

async function restartContainer(containerId) {
  if (!docker) {
    throw new Error('Docker is not available');
  }

  const container = docker.getContainer(containerId);
  await container.restart();
  return { success: true, message: `Container ${containerId} restarted` };
}

module.exports = {
  getContainerList,
  startContainer,
  stopContainer,
  restartContainer
};
