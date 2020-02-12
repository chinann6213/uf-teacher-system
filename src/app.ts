import * as express from 'express';
import { Application } from 'express';

class App {
  public app: Application;
  public port: number;

  constructor(config: {
    port: number;
    middleWares: any;
    controllers: any;
  }) {
    this.app = express();
    this.port = config.port;
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Listening on port http://localhost:${this.port}.`);
    })
  }

}

export default App;