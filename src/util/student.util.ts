import { Student } from "../entity/Student";
import { Repository, getConnection, Connection } from "typeorm";
import { Teacher } from "../entity/Teacher";

let studentRepo: Repository<Student>;
class StudentUtil {
  
  student: Student;

  constructor() {
    if (!studentRepo) {
      const connection: Connection = getConnection();
      studentRepo = connection.getRepository(Student);
    }
  }

  createStudent(studentEmail: string): void {
    const student = studentRepo.create({
      email: studentEmail
    })

    this.student = student;
  }

  async findOneStudent(): Promise<Student> {
    return await studentRepo.findOne(this.student);
  }

  async saveStudent(): Promise<Student> {
    return await studentRepo.save(this.student);
  }

  async findCommonStudent(teacher: string[]): Promise<Student[]> {
    return await studentRepo.createQueryBuilder("student")
        .leftJoin("student.teachers", "teacher")
        .where("teacher.email IN (:...teacherEmails)", {
          teacherEmails: teacher
        })
        .groupBy('student.email')
        .having('count(*) = :teacherCount', {
          teacherCount: teacher.length
        })
        .getMany();
  }

  async suspendStudent(student: string): Promise<void> {
    await studentRepo.update({
      email: student
    }, {
      suspend: true
    });
  }

  async findStudentToNotify(teacherEmail: string, mentionEmails: string[]): Promise<Student[]> {
    let whereClause = "student.suspend = 0 AND teacher.email = :teacherEmail";
    let whereParam = {
      teacherEmail: teacherEmail,
    };

    if (mentionEmails.length > 0) {
      whereClause += " OR student.suspend = 0 AND student.email IN (:...mentionEmails)";
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