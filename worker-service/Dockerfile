FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN mkdir -p logs outputs && chown -R appuser:appgroup /app

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('./src/config/redis').redisConnection.ping()" || exit 1

CMD ["node", "worker.js"]
