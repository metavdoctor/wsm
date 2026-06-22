// PM2 process config for the internal Windows production server.
// Usage:
//   npm run build
//   npx prisma migrate deploy
//   pm2 start ecosystem.config.js
//   pm2 save
//
// Change PORT below if 3000 is already used by another app on the server.
module.exports = {
  apps: [
    {
      name: "wsm-action-tracker",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
