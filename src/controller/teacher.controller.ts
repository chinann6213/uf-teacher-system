import * as express from 'express';
import { Request, Response } from 'express';
import Controller from 'interface/controller.interface';
import { Teacher } from '../entity/Teacher';
import TeacherUtil from '../util/teacher.util';
import StudentUtil from '../util/student.util';
import * as EmailValidator from 'email-validator';

class TeacherController implements Controller {
  public router = express.Router();

  teacherUtil: TeacherUtil;
  studentUtil: StudentUtil;

  invalidTeacherEmailMsg: string = 'Teacher email is invalid.';
  invalidStudentsEmailMsg: string = 'One of more teacher email(s) is invalid.';

  constructor() {
    this.initRoutes();
    this.initConnection();
  }

  initRoutes(): void {
    this.router.post('/register', (req, res) => this.registerStudentToATeacher(req, res));
    this.router.get('/commonstudents', (req, res) => this.findCommonStudent(req, res));
    this.router.post('/suspend', (req, res) => this.suspendStudent(req, res));
    this.router.post('/retrievefornotifications', (req, res) => this.listStudentToNotify(req, res));
  }

  initConnection(): void {
    this.teacherUtil = new TeacherUtil();
    this.studentUtil = new StudentUtil();
  }

  // question 1
  async registerStudentToATeacher(req: Request, res: Response): Promise<void> {
    const teacher: string = req.body.teacher;
    const students: string[] = req.body.students;

    if (!this._isEmailValid(teacher)) {
      res.status(422).send({
        message: this.invalidTeacherEmailMsg
      });
      return;
    }

    if (students.map(s => this._isEmailValid(s)).includes(false)) {
      res.status(422).send({
        message: 'One of more student email(s) is invalid.'
      });
      return;
    }
    
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

  // add teacher
  async _addTeacher(teacherEmail: string): Promise<Teacher> {
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
      return;
    }
  }

  // find registered students under specified teacher
  async _findStudentUnderTeacher(teacher: Teacher): Promise<Teacher> {
    try {
      
      const teacherWithStudents = await this.teacherUtil.findStudentUnderTeacher(teacher)
      return teacherWithStudents[0];
    } catch(err) {
      return;
    }
  }

  // assign student to specified teacher
  async _addStudentUnderTeacher(teacherWithStudents: Teacher, newStudentsEmails: string[]): Promise<Boolean> {

    const registeredStudents = teacherWithStudents.students;
    let existStudentEmail: string[] = registeredStudents.map(students => students.email);

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
  
  // question 2
  async findCommonStudent(req: Request, res: Response): Promise<void> {

    let teacher: string = req.query.teacher;
    let teachers: string[];

    // convert teacher email from string to array if there's only one teacher
    teachers = typeof teacher === 'string' ? teachers = [teacher] : teachers = teacher;

    if (teachers.map(s => this._isEmailValid(s)).includes(false)) {
      res.status(422).send({
        message: this.invalidStudentsEmailMsg
      });
      return;
    }

    try {
      const result = await this.studentUtil.findCommonStudent(teachers)

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

  // question 3
  async suspendStudent(req: Request, res: Response): Promise<void> {
    const student: string = req.body.student;

    if (!this._isEmailValid(student)) {
      res.status(422).send({
        message: 'Student email is invalid.'
      });
      return;
    }

    try {
      await this.studentUtil.suspendStudent(student);
      res.status(204).end();
    } catch(err) {
      res.status(500).send({
        message: 'Unable to suspend student.'
      });
    }
  }

  // question 4
  async listStudentToNotify(req: Request, res: Response): Promise<void> {
    const teacherEmail: string = req.body.teacher;
    const notification: string = req.body.notification;

    // extract emails from the notification
    let mentionEmails = notification.split(' ').filter(str => str.startsWith('@'));
    mentionEmails = mentionEmails.map(email => email.substr(1));

    if (!this._isEmailValid(teacherEmail)) {
      res.status(422).send({
        message: this.invalidTeacherEmailMsg
      });
      return;
    }

    if (mentionEmails.length > 0) {
      if (mentionEmails.map(d => this._isEmailValid(d)).includes(false)) {
        res.status(422).send({
          message: this.invalidStudentsEmailMsg
        });
        return;
      }
    }
    
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

  // email validator
  _isEmailValid(email: string): Boolean {
    return EmailValidator.validate(email);
  }
}

export default TeacherController;