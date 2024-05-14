# base image
FROM node:18.17.1-alpine AS base
ENV PNPM_HOME="~/.config/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json ./package.json
COPY . .
RUN yarn install --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY .env ./.env
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules

RUN yarn run build

FROM builder AS runner
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
EXPOSE 3000

CMD [ "yarn", "start:build" ]