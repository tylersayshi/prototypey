# Builds the prototypey.org site (packages/site) and serves it with nginx.
# Coolify builds this on every push to main (see .tangled/workflows/deploy.yml)
# and only swaps the container if the build succeeds.

FROM node:24.22.1-alpine AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/site/dist /usr/share/nginx/html
