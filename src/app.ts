import * as express from 'express';
import { Application } from 'express';
import 'reflect-metadata';

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

    this.middleWares(config.middleWares);
    this.routes(config.controllers);
  }

  private middleWares(middleWares: {
    forEach: (arg: (middleWare: any) => void) => void;
  }) {
    middleWares.forEach(middleWare => {
      this.app.use(middleWare);
    })
  }

  private routes(controllers: { 
    forEach: (arg: (controller: any) => void) => void; 
  }) {
    controllers.forEach(controller => {
        this.app.use('/api', controller.router)
    })
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Listening on port http://localhost:${this.port}.`);
    })
  }

}

export default App;