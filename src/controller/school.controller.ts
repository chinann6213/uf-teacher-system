import * as express from 'express';
import { Request, Response } from 'express';
import Controller from 'interface/controller.interface';
import { getRepository, Repository, getConnection } from 'typeorm';
import { Teacher } from '../entity/Teacher';
import { Student } from '../entity/Student';

let teacherRepo: Repository<Teacher>;
let studentRepo: Repository<Student>;

class SchoolController implements Controller {
  public router = express.Router();
  
  constructor() {
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/register', (req, res) => this.registerStudent(req, res));
    this.router.get('/commonstudents', (req, res) => this.findCommonStudent(req, res));
    this.router.post('/suspend', (req, res) => this.suspendStudent(req, res));
  }

  initConnection() {
    const connection = getConnection();
    
    if (!teacherRepo) {
      teacherRepo = connection.getRepository(Teacher);
    }

    if (!studentRepo) {
      studentRepo = connection.getRepository(Student);
    }
  }

  async registerStudent(req: Request, res: Response) {
    console.log(req.body);
    const teacher = req.body.teacher;
    const students = req.body.students;

    const result = await this._registerStudent(teacher, students);
    if (result.success) {
      res.status(204).end();
    } else {
      res.status(500).send({
        message: result.message
      });
    }
  }
  
  async _registerStudent(teacherEmail: string, studentsEmails: string[]) {
    if (teacherRepo === undefined || studentRepo === undefined) {
      this.initConnection();
    }

    try {
      // create teacher
      const teacher = teacherRepo.create({
        email: teacherEmail
      });

      // find teacher 
      let findTeacher = await teacherRepo.findOne(teacher);

      // save teacher if not exists
      if (!findTeacher) {
        findTeacher = await teacherRepo.save(teacher);
      } 

      // find registered students under specified teacher
      const findRegister = await teacherRepo.find({
        relations: ['students'],
        where: {
          tid: findTeacher.tid,
        }
      });

      console.log(findRegister)

      // extract the students email for exsitence checking
      let students = findRegister[0].students;
      let sEmail = students.map(students => students.email);

      // add student
      for (let idx in studentsEmails) {
        // create student
        const student = studentRepo.create({
          email: studentsEmails[idx],
        });

        // find student
        let findStudent = await studentRepo.findOne(student);

        // insert student if not exist
        if (!findStudent) {
          findStudent = await studentRepo.save(student);
        } 
        
        // add relationship
        if (!sEmail.includes(studentsEmails[idx])) {
          await teacherRepo.createQueryBuilder()
              .relation(Teacher, 'students')
              .of(findTeacher)
              .add(findStudent);
        }
      }

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
  
  async findCommonStudent(req: Request, res: Response) {
    console.log(req.query.teacher)
    if (studentRepo === undefined) {
      this.initConnection();
    }

    // const result = await teacherRepo.query(`select s.email from student s left join registration r
    // on s.sid = r.sid
    // left join teacher t on
    // t.tid = r.tid
    // where
    // t.email in ('ngchinann@gmail.com', 'kenken@gmail.com')
    // group by s.email having count(*) = 2`);

    // console.log(result);

    const result = await studentRepo.createQueryBuilder("student")
        .leftJoin("student.teachers", "teacher")
        .where("teacher.email IN (:...teacherEmails)", {
          teacherEmails: req.query.teacher
        })
        .groupBy('student.email')
        .having('count(*) = 2')
        .printSql()
        .getMany();

    let students = result.map(student => student.email);

    res.status(200).send({
      students: students
    });
  }

  async suspendStudent(req: Request, res: Response) {
    const student = req.body.student;

    if (studentRepo === undefined) {
      this.initConnection();
    }

    try {
      const result = await studentRepo.update({
        email: student
      }, {
        suspend: true
      });

      res.status(204).end();
    } catch(err) {
      res.status(500).send({
        message: 'Unable to suspend student.'
      });
    }


  }
}

export default SchoolController;