import App from './app';

import * as bodyParser from 'body-parser';

import { createConnection } from 'typeorm';
import TeacherController from './controller/teacher.controller';

createConnection().then(async () => {
  const app = new App({
    port: 8000,
    middleWares: [
      bodyParser.json(), // allow json body
    ],
    controllers: [
      new TeacherController(),
    ],
  });

  app.listen();
})