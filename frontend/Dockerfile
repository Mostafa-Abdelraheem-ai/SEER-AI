FROM node:20-alpine AS base

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

FROM base AS dev
COPY frontend /app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY frontend /app
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
