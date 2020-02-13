import * as express from 'express';
import { Request, Response } from 'express';
import Controller from 'interface/controller.interface';
import { Repository, getConnection } from 'typeorm';
import { Student } from '../entity/Student';

let studentRepo: Repository<Student>;
class TeacherController implements Controller {
  public router = express.Router();
  
  constructor() {
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/register', (req, res) => this.registerStudent(req, res));
  }

  initConnection() {
    const connection = getConnection();
    studentRepo = connection.getRepository(Student);
  }

  async registerStudent(req: Request, res: Response) {
    console.log(req.body);
    const teacher = req.body.teacher;
    const students = req.body.students;

    const result = await this._registerStudent(teacher);
    if (result.success) {
      res.status(204).end();
    } else {
      res.status(500).send({
        message: result.message
      });
    }
  }
  
  async _registerStudent(teacherEmail: string) {
    if (studentRepo === undefined) {
      this.initConnection();
    }

    // const teacherRepo = getRepository(Teacher);
    const teacher = studentRepo.create({
      email: teacherEmail
    });

    try {
      const result = await teacherRepo.save(teacher);
      
      return {
        success: true,
        message: 'Record inserted successfully.'
      };
    } catch(err) {
      console.log(err)
      
      return {
        success: false,
        message: 'Unexpected error occur when inserting teacher.'
      };
    }
  }
  
}

export default TeacherController;