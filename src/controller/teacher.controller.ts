import * as express from 'express';
import { Request, Response } from 'express';
import Controller from 'interface/controller.interface';

class TeacherController implements Controller {
  public router = express.Router();
  
  constructor() {
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/register', this.registerStudent);
  }

  registerStudent(req: Request, res: Response): void {
    console.log(req.body);

    res.status(204).end();
    // return;
  }
}

export default TeacherController;