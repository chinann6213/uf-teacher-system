import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class SetupDatabase1581520543458 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {

        // add create database query

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS teacher (
                tid INT(11) NOT NULL AUTO_INCREMENT,
                email VARCHAR(256) NOT NULL,
                PRIMARY KEY (tid)
            ) ENGINE=innodb;
        `);

        await queryRunner.query(`
            ALTER TABLE teacher ADD UNIQUE INDEX email (email);
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS student (
                sid INT(11) NOT NULL AUTO_INCREMENT,
                email VARCHAR(256) NOT NULL,
                suspended BOOLEAN NOT NULL DEFAULT 0, 
                PRIMARY KEY (sid)
            ) ENGINE=innodb;
        `);

        await queryRunner.query(`
            ALTER TABLE student ADD UNIQUE INDEX email (email);
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS registration (
                tid INT(11) NOT NULL,
                sid INT(11) NOT NULL,
                PRIMARY KEY (tid, sid),
                FOREIGN KEY (tid) REFERENCES teacher(tid),
                FOREIGN KEY (sid) REFERENCES student(sid)
            ) ENGINE=innodb;
        `);

        // add constraint on delete cascade
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
            DROP TABLE teacher;
        `);

        await queryRunner.query(`
            DROP TABLE student;
        `);

        await queryRunner.query(`
            DROP TABLE registration;
        `);
    }

}
