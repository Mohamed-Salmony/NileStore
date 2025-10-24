# Deployment Guide - Nile Essence Backend

## Performance Optimizations for Low-Resource Servers

### Built-in Optimizations
1. **Compression**: Gzip compression (level 6) for responses >1KB
2. **Rate Limiting**: 100 requests per 15 min per IP (production only)
3. **Security**: Helmet.js for security headers
4. **Graceful Shutdown**: Handles SIGTERM/SIGINT with 10s timeout
5. **Error Recovery**: Catches uncaught exceptions and unhandled rejections
6. **Memory Limits**: JSON body limited to 2MB
7. **Conditional Logging**: Morgan only in development

### Recommended Server Settings

#### For Free Tier Servers (256MB-512MB RAM)
```bash
# Set in .env
NODE_ENV=production
PORT=4000

# Use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name nile-api --max-memory-restart 200M
pm2 save
pm2 startup
```

#### PM2 Ecosystem File (ecosystem.config.js)
```javascript
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
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

### Database Setup (Supabase)

1. **Run Schema**: Copy `supabase-schema.sql` to Supabase SQL Editor and execute
2. **Create Storage Bucket**: 
   - Name: `NileStore-Files`
   - Public: No (use signed URLs)
3. **Set User Roles**: In Supabase Dashboard > Auth > Users > Edit User
   - Add to `app_metadata`: `{"role": "admin"}` or `{"role": "user"}`

### Deploy Steps

1. **Build**:
```bash
npm run build
```

2. **Set Environment Variables** on your server:
```bash
SUPABASE_URL=https://dmyaveumdljmodeomtff.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_BUCKET=NileStore-Files
NODE_ENV=production
PORT=4000
```

3. **Start with PM2**:
```bash
pm2 start ecosystem.config.js
pm2 logs nile-api
```

### Monitoring

- Health check: `GET /health`
- PM2 monitoring: `pm2 monit`
- Logs: `pm2 logs nile-api`

### Performance Tips

1. **Enable Supabase Connection Pooling** (Supabase Dashboard > Database > Connection Pooling)
2. **Use CDN** for static assets
3. **Enable Supabase Edge Functions** for geo-distributed requests
4. **Database Indexes**: Already included in schema
5. **Caching**: Consider Redis for session/cart caching (optional)

### Troubleshooting

- **High Memory**: Reduce `max_memory_restart` to 150M
- **Slow Responses**: Check Supabase query performance in Dashboard
- **Rate Limit Issues**: Adjust `windowMs` and `max` in `src/app.ts`
- **Connection Errors**: Verify `.env` credentials match Supabase
