# base image
FROM node:18.17.1-alpine AS base
ENV PNPM_HOME="~/.config/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . .

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile


FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 3000


RUN rm -rf /app/gcpKeyFile.json
CMD [ "pnpm", "start:build" ]

# # WORKDIR /app

# # COPY . .

# RUN npm i pnpm -g

# RUN pnpm i --frozen-lockfile

# RUN pnpm run build
# CMD ["pnpm", "start"]

