FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install typescript
COPY tsconfig.json .
COPY ./src ./src
RUN npm run build

RUN npm ci --omit=dev
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
# COPY . .

RUN rm -rf ./src
RUN rm -rf ./tsconfig.json

COPY get-credentials.sh .
COPY authorize.js .
# Run script
RUN chmod +x ./get-credentials.sh

# Default port to run app on
EXPOSE 8080

# Start server
CMD "./get-credentials.sh"
