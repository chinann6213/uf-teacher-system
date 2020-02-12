import App from './app';

const app = new App({
  port: 8000,
  middleWares: '',
  controllers: '',
});

app.listen();