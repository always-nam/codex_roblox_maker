FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node server.mjs planner.mjs ./
COPY --chown=node:node public ./public
USER node
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.mjs"]
