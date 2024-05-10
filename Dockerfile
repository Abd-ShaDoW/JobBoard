#specify base image
FROM node:20-alpine

# Install postgresql-client
RUN apk --no-cache add postgresql-client

# set the working directory in the container
WORKDIR /usr/app

# copy package.json and package-lock.json to the working directory
COPY ./package*.json ./
COPY prisma ./prisma

#install dependencies 

RUN npm install

COPY prisma ./prisma/


#copy the rest of the application code to the working directory
COPY . .

# Run `npx prisma generate` to generate the Prisma client
RUN npx prisma generate



#exposing port 300
EXPOSE 3000


#default command
CMD ["npm","start"]