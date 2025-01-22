FROM node:20-slim
WORKDIR /usr/src/app

# Install app dependencies
RUN apt-get update && apt-get install -y \
    bzip2

COPY package.json package-lock.json ./
RUN npm ci   # --production 플래그를 제거하여 devDependencies 설치
RUN npm cache clean --force
ENV NODE_ENV="production"
COPY . .
RUN npm run build
CMD [ "npm", "start" ]
