module.exports = {
  apps: [
    {
      name: 'mongo service',
      script: 'yarn devMongo',
      instances: 1,
      autorestart: true,
    },
    {
      name: 'client api',
      script: 'yarn server:start',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
    },
    {
      name: 'nest - admin service',
      script: 'yarn build & yarn start',
      args: 'start',
      instances: 1,
      autorestart: true,
    },
  ],
};
