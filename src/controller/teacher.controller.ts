import * as express from 'express';
import { Request, Response } from 'express';
import Controller from 'interface/controller.interface';
import { Repository, getConnection } from 'typeorm';
import { Teacher } from '../entity/Teacher';
import { Student } from '../entity/Student';
import TeacherUtil from '../util/teacher.util';
import StudentUtil from '../util/student.util';

let teacherRepo: Repository<Teacher>;
let studentRepo: Repository<Student>;

class TeacherController implements Controller {
  public router = express.Router();

  teacherUtil: TeacherUtil;
  studentUtil: StudentUtil;

  constructor() {
    this.initRoutes();
    this.initConnection();
  }

  initRoutes() {
    this.router.post('/register', (req, res) => this.registerStudentToATeacher(req, res));
    this.router.get('/commonstudents', (req, res) => this.findCommonStudent(req, res));
    this.router.post('/suspend', (req, res) => this.suspendStudent(req, res));
    this.router.post('/retrievefornotifications', (req, res) => this.listStudentToNotify(req, res));
  }

  initConnection() {
    this.teacherUtil = new TeacherUtil();
    this.studentUtil = new StudentUtil();
  }

  async registerStudentToATeacher(req: Request, res: Response) {
    const teacher = req.body.teacher;
    const students = req.body.students;
    
    const addedTeacher = await this._addTeacher(teacher);
    if (!addedTeacher) {
      res.status(500).send({
        message: 'Unable to add teacher.'
      });
      return;
    }
    
    const teacherWithStudent = await this._findStudentUnderTeacher(addedTeacher);
    if (!teacherWithStudent) {
      res.status(500).send({
        message: 'Unable to find student under specified teacher.'
      });
      return;
    }

    const addedStudentUnderTeacher = await this._addStudentUnderTeacher(teacherWithStudent, students);
    if (addedStudentUnderTeacher) {
      res.status(204).end();
    } else {
      res.status(500).send({
        message: 'Unable to assign students under specified teacher.'
      });
    }
  }

  async _addTeacher(teacherEmail: string) {
    try {
      
      this.teacherUtil.createTeacher(teacherEmail);
      // find teacher 
      let findTeacher = await this.teacherUtil.findOneTeacher()
  
      // save teacher if not exists
      if (!findTeacher) {
        findTeacher = await this.teacherUtil.saveTeacher();
      } 
  
      return findTeacher;
    } catch(err) {
      return false;
    }
  }

  // find registered students under specified teacher
  async _findStudentUnderTeacher(teacher: Teacher) {
    try {
      
      const teacherWithStudents = await this.teacherUtil.findStudentUnderTeacher(teacher)
      return teacherWithStudents[0];
    } catch(err) {
      return false;
    }
  }

  async _addStudentUnderTeacher(teacherWithStudents: Teacher, newStudentsEmails: string[]) {
    // extract the students email for exsitence checking

    console.log(newStudentsEmails)
    const registeredStudents = teacherWithStudents.students;
    let existStudentEmail = registeredStudents.map(students => students.email);

    try {
      for (let i in newStudentsEmails) {
        if (existStudentEmail.includes(newStudentsEmails[i])) {
          continue;
        }
  
        this.studentUtil.createStudent(newStudentsEmails[i]); // create student
    
        let findStudent = await this.studentUtil.findOneStudent(); // create student
  
        if (!findStudent) {
          findStudent = await this.studentUtil.saveStudent(); // create student
        } 
  
        await this.teacherUtil.assignStudents(findStudent); // create student
      }

      return true;
    } catch(err) {
      return false;
    }
  }
  
  async findCommonStudent(req: Request, res: Response) {

    let teacher = req.query.teacher;

    if (typeof teacher === 'string') {
      teacher = [teacher];
    }
  
    // const result = await teacherRepo.query(`select s.email from student s left join registration r
    // on s.sid = r.sid
    // left join teacher t on
    // t.tid = r.tid
    // where
    // t.email in ('ngchinann@gmail.com', 'kenken@gmail.com')
    // group by s.email having count(*) = 2`);

    try {
      const result = await this.studentUtil.findCommonStudent(teacher)

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

    try {
      await this.studentUtil.suspendStudent(student);
      res.status(204).end();
    } catch(err) {
      res.status(500).send({
        message: 'Unable to suspend student.'
      });
    }
  }

  async listStudentToNotify(req: Request, res: Response) {
    // `select s.email from student s left join registration r on 
    // s.sid = r.sid 
    // left join teacher t on t.tid = r.tid 
    // where t.email = 'ngchinann@gmail.com' and s.suspend = 0 or 
    // s.email in ('studentjon@example.com') group by s.email;`

    const teacherEmail = req.body.teacher;
    const notification: string = req.body.notification;

    // extract emails from the notification
    let mentionEmails = notification.split(' ').filter(str => str.startsWith('@'));
    mentionEmails = mentionEmails.map(email => email.substr(1));
    
    try {
      const result = await this.studentUtil.findStudentToNotify(teacherEmail, mentionEmails);

      const recipients = result.map(d => d.email);
      res.status(200).send({
        recipients: recipients
      });
    } catch(err) {
      res.status(500).send({
        message: 'Unable to list student to notify.'
      })
    }
  }

  test() {
    this.teacherUtil.createTeacher('ngchinann@gmail.com');
  }


  
}

export default TeacherController;