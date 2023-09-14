import json
import os
from urllib.request import urlopen
import mysql.connector as mysql
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Form, requests
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import bcrypt
import uvicorn

load_dotenv("cred.env")

# Read Database connection variables
db_host = os.environ['MYSQL_HOST']
db_user = os.environ['MYSQL_USER']
db_pass = os.environ['MYSQL_PASSWORD']
db_name = os.environ['MYSQL_DATABASE']

app = FastAPI()

app.mount("/public", StaticFiles(directory="public"), name="public")
app.mount("/favicons", StaticFiles(directory="favicons"), name="favicons")


# Checks if the login info is correct
def authenticate_user(username: str, password: str) -> bool:
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    cursor = db.cursor()
    query = 'select * from Accounts where user_name=%s or email = %s'
    cursor.execute(query, (username, username,))
    result = cursor.fetchone()
    cursor.close()
    db.close()

    if result is not None:
        if bcrypt.checkpw(password.encode('utf-8'), result[6].encode('utf-8')):
            return makeSession(result[0])
    return -999


# Make a new session in the session table
def makeSession(user_id: int):
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    cursor = db.cursor()
    try:
        query = "insert into sessions (user_id) values (%s)"
        values = (user_id,)
        cursor.execute(query, values)
        db.commit()
        session_id = cursor.lastrowid
    except Exception as err:
        return 404
    finally:
        cursor.close()
        db.close()

    return session_id


# Landing Page Route
@app.get("/", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("htmls/index.html") as html:
        return HTMLResponse(content=html.read())


# Recover Register Route
@app.get("/register", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("htmls/register.html") as html:
        return HTMLResponse(content=html.read())


# Recover Login Route
@app.get("/login", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("htmls/login.html") as html:
        return HTMLResponse(content=html.read())


# Recover MVP Route
@app.get("/mvp", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("htmls/mvp.html") as html:
        return HTMLResponse(content=html.read())


# Profile Page Route
@app.get("/profile", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("htmls/profile.html") as html:
        return HTMLResponse(content=html.read())


# Loads leaderboard page
@app.get("/leaderboard", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("htmls/leaderboard.html") as html:
        return HTMLResponse(content=html.read())


# Recovery Page Route
@app.get("/accountRecovery", response_class=HTMLResponse)
def get_html() -> HTMLResponse:
    with open("htmls/recoverAccount.html") as html:
        return HTMLResponse(content=html.read())


# Adds a new account
@app.post("/registerUser")
def register_user(data: dict):
    f_name = data["first_name"]
    l_name = data["last_name"]
    pid = data["PID"]
    email = data["email"]
    u_name = data["user_name"]
    pass_w = data["password"]

    # Hash the password
    hashed_pass = bcrypt.hashpw(pass_w.encode("utf-8"), bcrypt.gensalt())
    # Limit the length of the hash to 100 characters
    hashed_pass = hashed_pass[:100].decode("utf-8")

    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Check for uniqueness
    cursor.execute(f"SELECT * FROM Accounts WHERE email = '{email}'")
    exists = cursor.fetchone()
    if exists:
        db.close()
        return 1
    cursor.execute(f"SELECT * FROM Accounts WHERE user_name = '{u_name}'")
    exists = cursor.fetchone()
    if exists:
        db.close()
        return 2

    # Adds idea to database
    cursor.execute(f"insert into Accounts(first_name, last_name, PID, email, user_name, password, admin_stat)"
                   f" values('{f_name}','{l_name}','{pid}', '{email}','{u_name}','{hashed_pass}','{0}')")
    db.commit()
    db.close()
    return 0


# Logins in user
@app.post("/checkLogin")
def check_login(data: dict):
    user_name = data["user_name"]
    password = data["password"]

    return authenticate_user(user_name, password)


# Recover user account
@app.put("/recoverUser")
def recover_password(data: dict):
    f_name = data["first_name"]
    l_name = data["last_name"]
    pid = data["PID"]
    email = data["email"]
    u_name = data["user_name"]
    pass_w = data["password"]

    # Hash the password
    hashed_pass = bcrypt.hashpw(pass_w.encode("utf-8"), bcrypt.gensalt())
    # Limit the length of the hash to 100 characters
    hashed_pass = hashed_pass[:100].decode("utf-8")

    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    query = "SELECT * FROM Accounts WHERE first_name = %s AND last_name = %s AND PID = %s AND email = %s AND" \
            " user_name = %s"
    cursor.execute(query, (f_name, l_name, pid, email, u_name))
    exists = cursor.fetchone()
    if exists:
        # Update Value
        update_query = "UPDATE Accounts SET password = %s WHERE first_name = %s AND last_name = %s AND PID = %s " \
                       "AND email = %s AND user_name = %s"
        cursor.execute(update_query, (hashed_pass, f_name, l_name, pid, email, u_name))
        db.commit()
        db.close()
        return True
    db.close()
    return False


# Updates email in SQL table
@app.post("/updateEmail")
def email_update(data: dict):
    old = data["old"]
    new = data["new"]
    id = data["id"]

    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Gets session_id
    query = "SELECT * FROM sessions WHERE session_id= %s"
    cursor.execute(query, (id,))
    session_id = cursor.fetchone()
    session_id = session_id[1]

    # Checks old email
    query = "SELECT * FROM Accounts WHERE id = %s"
    cursor.execute(query, (session_id,))
    exists_old = cursor.fetchone()

    if exists_old[4] != old:
        return 1

    # Checks new email
    query = "SELECT * FROM Accounts WHERE email = %s"
    cursor.execute(query, (new,))
    exists_new = cursor.fetchone()

    if exists_new:
        return 2

    query = "UPDATE Accounts SET email = %s WHERE id = %s"
    cursor.execute(query, (new, session_id))
    db.commit()
    db.close()

    return 0


# Updates username in SQL table
@app.post("/updateUsername")
def username_update(data: dict):
    old = data["old"]
    new = data["new"]
    id = data["id"]

    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Gets session_id
    query = "SELECT * FROM sessions WHERE session_id= %s"
    cursor.execute(query, (id,))
    session_id = cursor.fetchone()
    session_id = session_id[1]

    # Checks old username
    query = "SELECT * FROM Accounts WHERE id = %s"
    cursor.execute(query, (session_id,))
    exists_old = cursor.fetchone()

    if exists_old[5] != old:
        return 1

    # Checks new username
    query = "SELECT * FROM Accounts WHERE user_name = %s"
    cursor.execute(query, (new,))
    exists_new = cursor.fetchone()

    if exists_new:
        return 2

    query = "UPDATE Accounts SET user_name = %s WHERE id = %s"
    cursor.execute(query, (new, session_id))

    query = "UPDATE Comments SET user = %s WHERE user_id = %s"
    cursor.execute(query, (new, session_id))
    db.commit()
    db.close()
    return 0


# Updates password in SQL table
@app.post("/updatePassword")
def password_update(data: dict):
    old = data["old"]
    new = data["new"]
    id = data["id"]

    # Hash the password
    old_pass = bcrypt.hashpw(old.encode("utf-8"), bcrypt.gensalt())
    # Limit the length of the hash to 100 characters
    old_pass = old_pass[:100].decode("utf-8")

    # Hash new the password
    new_pass = bcrypt.hashpw(new.encode("utf-8"), bcrypt.gensalt())
    # Limit the length of the new hash to 100 characters
    new_pass = new_pass[:100].decode("utf-8")

    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Gets session_id
    query = "SELECT * FROM sessions WHERE session_id= %s"
    cursor.execute(query, (id,))
    session_id = cursor.fetchone()
    session_id = session_id[1]

    # Checks old password
    query = "SELECT * FROM Accounts WHERE id = %s"
    cursor.execute(query, (session_id,))
    exists_old = cursor.fetchone()

    if not bcrypt.checkpw(old.encode('utf-8'), exists_old[6].encode('utf-8')):
        return 1

    query = "UPDATE Accounts SET password = %s WHERE id = %s"
    cursor.execute(query, (new_pass, session_id))
    db.commit()
    db.close()
    return 0


# Logs out user and updates SQL table
@app.post("/logout")
def logout_user(data: dict):
    s_id = data["id"]

    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Gets session_id
    query = "DELETE FROM sessions WHERE session_id= %s"
    cursor.execute(query, (s_id,))
    db.commit()
    db.close()
    return "Logged out"


# Gets current user_id
@app.post("/getUserID")
def get_user_id(data: dict):
    id = data["id"]

    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Gets user id
    query = 'SELECT user_id FROM sessions WHERE session_id= %s'
    cursor.execute(query, (id,))
    result = cursor.fetchone()
    db.commit()
    db.close()
    return result


# Loads comments from SQL table
@app.post("/getComments")
def get_comments(data: dict):
    id = data["id"]
    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Gets user id
    query = 'SELECT * FROM comments WHERE team_id= %s'
    cursor.execute(query, (id,))
    result = cursor.fetchall()
    db.commit()
    db.close()

    return result


# Deletes the comment from the SQL table
@app.post("/deletecomment")
def delete_comment(data: dict):
    id = data["id"]
    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Gets user id
    query = 'DELETE FROM comments WHERE id= %s'
    cursor.execute(query, (id,))
    db.commit()
    db.close()


# Gets the username
@app.post("/getUser")
def delete_comment(data: dict):
    id = data["id"]
    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Gets user id
    query = 'Select user_name from Accounts where id=%s'
    cursor.execute(query, (id,))
    result = cursor.fetchone()
    db.commit()
    db.close()
    return result


# Add a comment into the SQL table
@app.post("/addComment")
def add_comment(data: dict):
    print(data)
    team_id = data["team_id"]
    user_id = data["user_id"]
    user = data["user"]
    comment = data["comment"]
    # connect to the database
    db = mysql.connect(host=db_host, database=db_name, user=db_user, passwd=db_pass)
    # preparing a cursor object
    cursor = db.cursor()

    # Insert comment into Comments table
    query = 'INSERT INTO comments (team_id, user_id, user, comment) VALUES (%s, %s, %s, %s)'
    cursor.execute(query, (team_id, user_id, user, comment))
    db.commit()
    db.close()
    return cursor.lastrowid


# Not implemented
@app.post("editComment")
def edit_comment(data: dict):
    print(data)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6543)
