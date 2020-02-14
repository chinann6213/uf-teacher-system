import * as express from 'express';
import { Request, Response } from 'express';
import Controller from 'interface/controller.interface';
import { getRepository, Repository, getConnection } from 'typeorm';
import { Teacher } from '../entity/Teacher';
import { Student } from '../entity/Student';

let teacherRepo: Repository<Teacher>;
let studentRepo: Repository<Student>;

class TeacherController implements Controller {
  public router = express.Router();
  
  constructor() {
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/register', (req, res) => this.registerStudentToATeacher(req, res));
    this.router.get('/commonstudents', (req, res) => this.findCommonStudent(req, res));
    this.router.post('/suspend', (req, res) => this.suspendStudent(req, res));
    this.router.post('/retrievefornotifications', (req, res) => this.listStudentToNotify(req, res));
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

  async registerStudentToATeacher(req: Request, res: Response) {
    const teacher = req.body.teacher;
    const students = req.body.students;

    this.initConnection();    
    
    const addedTeacher = await this.addTeacher(teacher);
    if (!addedTeacher) {
      res.status(500).send({
        message: 'Unable to add teacher.'
      });
      return;
    }
    
    const teacherWithStudent = await this.findStudentUnderTeacher(addedTeacher);

    if (!teacherWithStudent) {
      res.status(500).send({
        message: 'Unable to find student under specified teacher.'
      });
      return;
    }

    const addedStudentUnderTeacher = await this.addStudentUnderTeacher(teacherWithStudent, students);
    
    if (addedStudentUnderTeacher) {
      res.status(204).end();
    } else {
      res.status(500).send({
        message: 'Unable to assign students under specified teacher.'
      });
    }
  }

  async addTeacher(teacherEmail: string) {
    try {
      const teacher = teacherRepo.create({
        email: teacherEmail
      });
  
      // find teacher 
      let findTeacher = await teacherRepo.findOne(teacher);
  
      // save teacher if not exists
      if (!findTeacher) {
        findTeacher = await teacherRepo.save(teacher);
      } 
  
      return findTeacher;
    } catch(err) {
      return false;
    }
  }

  async findStudentUnderTeacher(teacher: Teacher) {
    // find registered students under specified teacher
    try {
      const teacherWithStudents = await teacherRepo.find({
        relations: ['students'],
        where: {
          tid: teacher.tid,
        }
      });
  
      return teacherWithStudents[0];
    } catch(err) {
      return false;
    }
  }

  async addStudentUnderTeacher(teacherWithStudents: Teacher, newStudentsEmails: string[]) {
    // extract the students email for exsitence checking
    const registeredStudents = teacherWithStudents.students;
    let existStudentEmail = registeredStudents.map(students => students.email);

    try {
      for (let i in newStudentsEmails) {
        if (existStudentEmail.includes(newStudentsEmails[i])) {
          continue;
        }
  
        // create student
        const student = studentRepo.create({
          email: newStudentsEmails[i],
        });
  
        // find student
        let findStudent = await studentRepo.findOne(student);
  
        // insert student if not exist
        if (!findStudent) {
          findStudent = await studentRepo.save(student);
        } 
  
        // add relationship
        await teacherRepo.createQueryBuilder()
            .relation(Teacher, 'students')
            .of(teacherWithStudents)
            .add(findStudent);
      }

      return true;
    } catch(err) {
      return false;
    }
  }
  
  async findCommonStudent(req: Request, res: Response) {
    this.initConnection();

    // const result = await teacherRepo.query(`select s.email from student s left join registration r
    // on s.sid = r.sid
    // left join teacher t on
    // t.tid = r.tid
    // where
    // t.email in ('ngchinann@gmail.com', 'kenken@gmail.com')
    // group by s.email having count(*) = 2`);
    try {
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
    } catch(err) {
      res.status(500).send({
        message: 'Unable to query common student.'
      })
    }
    
  }

  async suspendStudent(req: Request, res: Response) {
    const student = req.body.student;

    this.initConnection();

    try {
      await studentRepo.update({
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

  async listStudentToNotify(req: Request, res: Response) {
    `select s.email from student s left join registration r on 
    s.sid = r.sid 
    left join teacher t on t.tid = r.tid 
    where t.email = 'ngchinann@gmail.com' and s.suspend = 0 or 
    s.email in ('studentjon@example.com') group by s.email;`

    const teacher = req.body.teacher;
    let notification: string = req.body.notification;
    let mentionEmails = notification.split(' ').filter(str => str.startsWith('@'));
    mentionEmails = mentionEmails.map(email => email.substr(1));
    
    this.initConnection();

    try {
      const result = await studentRepo.createQueryBuilder("student")
          .leftJoin("student.teachers", "teacher")
          .where("student.suspend = 0 AND teacher.email = :teacherEmail OR student.email IN (:...mentionEmails)", {
            teacherEmail: req.query.teacher,
            mentionEmails: mentionEmails
          })
          .groupBy('student.email')
          .printSql()
          .getMany();

      res.status(200).send(result);
    } catch(err) {
      res.status(500).send({
        message: 'Unable to list student to notify.'
      })
    }
  }
}

export default TeacherController;