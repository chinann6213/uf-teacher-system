import App from './app';

import * as bodyParser from 'body-parser';

import TeacherController from './controller/teacher.controller';

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