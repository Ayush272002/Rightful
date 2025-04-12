FROM node:22.12.0

WORKDIR /app

COPY package* .

COPY . .

RUN npm install

RUN npm run build

EXPOSE 8000

CMD ["node", "dist/index.js"]    