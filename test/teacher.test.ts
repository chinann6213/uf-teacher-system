import { Request } from 'express';
import { createConnection, Connection } from 'typeorm';
import TeacherController from '../src/controller/teacher.controller';
import TeacherUtil from '../src/util/teacher.util';
import StudentUtil from '../src/util/student.util';
import { Teacher } from '../src/entity/Teacher';
import { Student } from '../src/entity/Student';

jest.mock('../src/util/teacher.util');
jest.mock('../src/util/student.util');

let conn: Connection;

beforeAll(async () => {
  conn = await createConnection();
});

afterAll(() => {
  conn.close();
});

it('it should run add teacher', async () => {
  const req = {
    body: {
      "teacher": "teacherken@gmail.com",
      "students": [
          "studentbob@example.com",
          "studentagnes@example.com",
          "studentmiche@example.com"
      ]
    }
  } as Request;
  
  const createTeacher = jest.spyOn(TeacherUtil.prototype, 'createTeacher');
  const findOneTeacher = jest.spyOn(TeacherUtil.prototype, 'findOneTeacher');
  const saveTeacher = jest.spyOn(TeacherUtil.prototype, 'saveTeacher');
  
  const teacherController = new TeacherController();
  await teacherController._addTeacher(req.body.teacher);

  expect(createTeacher).toHaveBeenCalledTimes(1);
  expect(findOneTeacher).toHaveBeenCalledTimes(1);
  expect(saveTeacher).toHaveBeenCalledTimes(1);

  // conn.close();
})

it('it should found students under specified teacher', async () => {

  // const conn = await createConnection();
  const teacher = new Teacher();
  teacher.email = 'teacherken@gmail.com'
  const data = {
    teacher: teacher
  }
  
  const findStudentUnderTeacher = jest.spyOn(TeacherUtil.prototype, 'findStudentUnderTeacher');
  
  const teacherController = new TeacherController();
  await teacherController._findStudentUnderTeacher(data.teacher);

  expect(findStudentUnderTeacher).toHaveBeenCalledTimes(1);

})

it('it should add students to a teacher', async () => {

  // const conn = await createConnection();
  const mockTeacherWithStudents = new Teacher();
  mockTeacherWithStudents.email = 'teacherken@gmail.com';

  const student = new Student();
  student.email = 'studentjon@gmail.com';

  mockTeacherWithStudents.students = [
    student
  ]

  const mockNewStudentsEmail = [
    'studentann@gmail.com'
  ]
  
  const createStudent = jest.spyOn(StudentUtil.prototype, 'createStudent');
  const findOneStudent = jest.spyOn(StudentUtil.prototype, 'findOneStudent');
  const saveStudent = jest.spyOn(StudentUtil.prototype, 'saveStudent');
  const findStudentUnderTeacher = jest.spyOn(TeacherUtil.prototype, 'assignStudents');

  const teacherController = new TeacherController();
  await teacherController._addStudentUnderTeacher(mockTeacherWithStudents, mockNewStudentsEmail);

  expect(createStudent).toHaveBeenCalledTimes(1);
  expect(findOneStudent).toHaveBeenCalledTimes(1);
  expect(saveStudent).toHaveBeenCalledTimes(1);
  expect(findStudentUnderTeacher).toHaveBeenCalledTimes(1);
})

it('it should not run add students to a teacher', async () => {

  // const conn = await createConnection();
  const mockExistsTeacher = new Teacher();
  mockExistsTeacher.email = 'teacherkennn@gmail.com';

  const s = new Student();
  s.email = 'studentjon@gmail.com';

  mockExistsTeacher.students = [
    s
  ]

  const mockExistsEmail = [
    'studentjon@gmail.com',
  ]
  
  // const createStudent2 = jest.spyOn(StudentUtil.prototype, 'createStudent').mockImplementation();
  StudentUtil.prototype.createStudent = jest.fn();
  StudentUtil.prototype.findOneStudent = jest.fn();
  StudentUtil.prototype.saveStudent = jest.fn();
  TeacherUtil.prototype.assignStudents = jest.fn();

  const wwww = new TeacherController();
  await wwww._addStudentUnderTeacher(mockExistsTeacher, mockExistsEmail);

  expect(StudentUtil.prototype.createStudent).not.toHaveBeenCalled();
  expect(StudentUtil.prototype.findOneStudent).not.toHaveBeenCalled();
  expect(StudentUtil.prototype.saveStudent).not.toHaveBeenCalled();
  expect(TeacherUtil.prototype.assignStudents).not.toHaveBeenCalled();

})