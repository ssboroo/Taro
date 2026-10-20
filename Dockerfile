FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json server.mjs ./
COPY --chown=node:node public ./public
COPY --chown=node:node server ./server
COPY --chown=node:node drizzle ./drizzle
RUN mkdir -p /app/data && chown node:node /app/data
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "server.mjs"]
