# base image
FROM node:18.17.1-alpine AS base
ENV PNPM_HOME="~/.config/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . .
COPY .env ./.env
RUN pnpm install
RUN pnpm run build

FROM base
EXPOSE 3000

CMD [ "pnpm", "start:build" ]