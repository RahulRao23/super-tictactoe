FROM node:18

WORKDIR /app

COPY package.json /app/

RUN npm i

COPY . .

EXPOSE 3000

CMD ["node", "express.js"]
