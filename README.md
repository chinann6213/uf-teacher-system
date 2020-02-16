
# UF Teacher System

### Steps to run this repository:
1. git clone https://github.com/chinann6213/uf-teacher-system.git
2/ run `npm install`
3. Configure MySQL credentials
```
"host": HOST,
"port": PORT,
"username": YOUR_USERNAME,
"password": YOUR_PASSWORD,
"database": "x_school"
```
4. Import the database by running `ts-node ./node_modules/typeorm/cli.js migration:run`
5. run `npm run dev` to start the dev server

### Testing
Tests are only written for Task 1 as it requires several condition checking.
To test, run `npm run test`

* Make sure the MySQL database is turned on before running the command.

### File Structure
#### 1. src - the source code folder
	1. src/controller - controller for express app routing
	2. src/entity - entities definition for typeorm
	3. src/interface - interface used by controller
	4. src/migration - mainly to create database schema
	5. src/util - helper function for controller

#### 2. test - contains scripts for testing

### Misc.
This project uses:
1. typescript for programming language
2. expressJs for HTTP request routing
3. MySQL for database
4. typeorm for MySQL data mapping
5. jest for testing
6. babel to compile typescript for testing
7. nodemon for development environment monitoring
