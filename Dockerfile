FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --omit=dev
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Run script
RUN chmod +x ./get-credentials.sh

# Default port to run app on
EXPOSE 8080

RUN cat .data/spotify.data

# Start server
CMD "./get-credentials.sh"
