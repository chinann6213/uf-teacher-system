import App from './app';

import * as bodyParser from 'body-parser';

import { createConnection } from 'typeorm';
import SchoolController from './controller/school.controller';

const app = new App({
  port: 8000,
  middleWares: [
    bodyParser.json(), // allow json body
  ],
  controllers: [
    new SchoolController(),
  ],
});

createConnection().then(async () => {
  app.listen();
})