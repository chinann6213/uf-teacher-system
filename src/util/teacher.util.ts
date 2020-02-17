import { Repository, getConnection, Connection } from "typeorm";
import { Teacher } from "../entity/Teacher";
import { Student } from "../entity/Student";

let teacherRepo: Repository<Teacher>;

class TeacherUtil {

  teacher: Teacher;
  teacherWithStudents: Teacher[];

  constructor() {
    
    if (!teacherRepo) {
      const connection: Connection = getConnection();
      teacherRepo = connection.getRepository(Teacher);
    }
  }

  createTeacher(teacherEmail: string): void {
    const teacher = teacherRepo.create({
      email: teacherEmail
    });

    this.teacher = teacher;
  }

  async findOneTeacher(): Promise<Teacher> {
    return await teacherRepo.findOne(this.teacher);
  }

  async saveTeacher(): Promise<Teacher> {
    return await teacherRepo.save(this.teacher);
  }

  async findStudentUnderTeacher(teacher: Teacher): Promise<Teacher[]> {
    const teacherWithStudents = await teacherRepo.find({
      relations: ['students'],
      where: {
        tid: teacher.tid,
      }
    });

    this.teacherWithStudents = teacherWithStudents;
    return teacherWithStudents;
  }

  async assignStudents(findStudent: Student): Promise<void> {
    await teacherRepo.createQueryBuilder()
        .relation(Teacher, 'students')
        .of(this.teacherWithStudents)
        .add(findStudent);
  }
}

export default TeacherUtil;