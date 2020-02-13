import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Student } from "./Student";

@Index("email", ["email"], { unique: true })
@Entity("teacher", { schema: "x_school" })
export class Teacher {

  @PrimaryGeneratedColumn({ 
    type: "int", 
    name: "tid" 
  })
  tid: number;

  @Column("varchar", { 
    name: "email", 
    unique: true, 
    length: 256 
  })
  email: string;

  @ManyToMany(
    () => Student,
    student => student.teachers
  )
  @JoinTable({
    name: "registration",
    joinColumns: [{ name: "tid", referencedColumnName: "tid" }],
    inverseJoinColumns: [{ name: "sid", referencedColumnName: "sid" }],
    schema: "x_school"
  })
  students: Student[];
}
