FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# Set environment variables
ENV DB_USER=postgres
ENV DB_HOST=postgres
ENV DB_NAME=link_sphere
ENV DB_PASSWORD=postgres
ENV DB_PORT=5432
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV REDIS_ENABLED=true

EXPOSE 3002

CMD ["npm", "run", "dev"] 