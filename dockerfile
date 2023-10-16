FROM node:lts-alpine
WORKDIR /
COPY . .
RUN npm install
CMD ["npm", "run", "production"]
