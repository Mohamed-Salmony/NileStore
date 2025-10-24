module.exports = {
  apps: [{
    name: 'nile-api',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
