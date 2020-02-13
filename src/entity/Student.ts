import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Teacher } from "./Teacher";


@Index("email", ["email"], { unique: true })
@Entity("student", { schema: "x_school" })
export class Student {

  @PrimaryGeneratedColumn({ 
    type: "int", 
    name: "sid" 
  })
  sid: number;

  @Column("varchar", { 
    name: "email", 
    unique: true, 
    length: 256 
  })
  email: string;

  @ManyToMany(
    () => Teacher,
    teacher => teacher.students
  )
  teachers: Teacher[];
}
