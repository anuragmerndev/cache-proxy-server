ARG PORT=8000
ARG ORIGIN=http://dummyjson.com

FROM node:20-alpine AS base
WORKDIR /app

FROM base as build
COPY package*.json .
COPY tsconfig.json .
COPY ./src ./src
RUN npm ci
RUN npm run build

FROM base as runner
COPY package*.json .
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

# Set environment variables correctly
ARG PORT=8000
ARG ORIGIN=http://dummyjson.com
ENV PORT=${PORT}
ENV ORIGIN=${ORIGIN}

EXPOSE ${PORT}

CMD ["sh", "-c", "npm run start:prod -- --port $PORT --origin $ORIGIN"]