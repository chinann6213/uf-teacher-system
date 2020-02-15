import { Student } from "../entity/Student";
import { Connection, Repository, getConnection } from "typeorm";

let studentRepo: Repository<Student>;

class StudentUtil {
  
  student: Student;

  constructor() {
    if (!studentRepo) {
      const connection = getConnection();
      studentRepo = connection.getRepository(Student);
    }
  }

  createStudent(studentEmail: string) {
    const student = studentRepo.create({
      email: studentEmail
    })

    this.student = student;
  }

  async findOneStudent() {
    return await studentRepo.findOne(this.student);
  }

  async saveStudent() {
    return await studentRepo.save(this.student);
  }

  async findCommonStudent(teacher: string[]) {
    return await studentRepo.createQueryBuilder("student")
        .leftJoin("student.teachers", "teacher")
        .where("teacher.email IN (:...teacherEmails)", {
          teacherEmails: teacher
        })
        .groupBy('student.email')
        .having('count(*) = :teacherCount', {
          teacherCount: teacher.length
        })
        .printSql()
        .getMany();
  }

  async suspendStudent(student: string) {
    await studentRepo.update({
      email: student
    }, {
      suspend: true
    });
  }

  async findStudentToNotify(teacherEmail: string, mentionEmails: string[]) {
    let whereClause = "student.suspend = 0 AND teacher.email = :teacherEmail";
    let whereParam = {
      teacherEmail: teacherEmail,
    };

    if (mentionEmails.length > 0) {
      whereClause += " OR student.email IN (:...mentionEmails)";
      whereParam['mentionEmails'] = mentionEmails;
    }

    return await studentRepo.createQueryBuilder("student")
        .leftJoin("student.teachers", "teacher")
        .where(whereClause, whereParam)
        .groupBy('student.email')
        .printSql()
        .getMany();
  }


}

export default StudentUtil;