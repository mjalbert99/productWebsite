import mysql.connector as mysql
import os
import bcrypt
from dotenv import load_dotenv

# ADMIN LOGIN: admin admin123

load_dotenv("cred.env")

# Read Database connection variables
db_host = os.environ['MYSQL_HOST']
db_user = os.environ['MYSQL_USER']
db_pass = os.environ['MYSQL_PASSWORD']


# Connect to the db and create a cursor object
db = mysql.connect(user=db_user, password=db_pass, host=db_host)
cursor = db.cursor()


# Creates database
cursor.execute("CREATE DATABASE if not exists FinalTech")
cursor.execute("USE FinalTech")

# creates accounts table in database
cursor.execute("drop table if exists sessions;")
cursor.execute("drop table if exists Accounts;")
try:
   cursor.execute("""
   CREATE TABLE Accounts (
      id  integer  AUTO_INCREMENT PRIMARY KEY,
      first_name varchar(100) not null,
      last_name varchar(100) not null,
      PID varchar(100) not null,
      email varchar(100) not null COLLATE utf8mb4_bin,
      user_name varchar(100) not null COLLATE utf8mb4_bin,
      password varchar(100) not null COLLATE utf8mb4_bin,
      admin_stat int not null
   );
 """)
except RuntimeError as err:
   print("runtime error: {0}".format(err))

# creates session table in database
try:
   cursor.execute("""
   CREATE TABLE sessions (
        session_id integer AUTO_INCREMENT PRIMARY KEY,
        user_id integer not null,
        created_at timestamp not null default current_timestamp,
        CONSTRAINT Fk_sessions_accounts foreign key (user_id) references Accounts(id)
   );
 """)
except RuntimeError as err:
   print("runtime error: {0}".format(err))


# creates session table in database
cursor.execute("drop table if exists comments;")
try:
   cursor.execute("""
   CREATE TABLE comments (
        id  integer AUTO_INCREMENT PRIMARY KEY,
        team_id integer not null,
        user_id integer not null,
        user varchar(256) not null,
        comment text not null
   );
 """)
except RuntimeError as err:
   print("runtime error: {0}".format(err))

#admin password
pass_w = "admin123"
hashed_pass = bcrypt.hashpw(pass_w.encode("utf-8"), bcrypt.gensalt())
# Limit the length of the hash to 100 characters
hashed_pass = hashed_pass[:100].decode("utf-8")

#default user password
pass_w2 = "mateo"
hashed_pass2 = bcrypt.hashpw(pass_w2.encode("utf-8"), bcrypt.gensalt())
# Limit the length of the hash to 100 characters
hashed_pass2 = hashed_pass2[:100].decode("utf-8")

# Inserts default values into menu
query = "insert into Accounts (first_name, last_name, PID, email, user_name, password, admin_stat)" \
        " values (%s, %s, %s, %s, %s, %s, %s)"
values = [
   ("Matthew", "Jalbert", "16523481", "mjalbert@ucsd.edu", "admin", hashed_pass, 1),
]
cursor.executemany(query, values)

query = "insert into comments (team_id, user_id, user, comment) values(%s, %s, %s, %s)"
values = [ ("1", "1", "admin", "can be deleted by the admin account")]
cursor.executemany(query, values)

db.commit()