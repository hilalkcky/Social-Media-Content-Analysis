from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import pyodbc
import pickle
import requests
import urllib.parse
from datetime import datetime
from googleapiclient.discovery import build

load_dotenv()

db_server = os.getenv("DB_SERVER")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_database = os.getenv("DB_DATABASE")
db_port = os.getenv("DB_PORT")
Youtube_Api_Key = os.getenv("YOUTUBE_API_KEY")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_connection():
    return pyodbc.connect(
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={db_server},{db_port};"
        f"DATABASE={db_database};"
        f"UID={db_user};"
        f"PWD={db_password};"
        f"TrustServerCertificate=yes;"
    )

vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
model = pickle.load(open("model.pkl", "rb"))

LABELS = [
    "Olumsuz Yorum",
    "Nefret Söylemi",
    "Müstehcen",
    "Tehdit",
    "Hakaret",
    "Kimlik Nefreti"
]

class AnalyzeRequest(BaseModel):
    input: str

class ContactRequest(BaseModel):
    name: str
    email: str
    message: str

def get_youtube_comments(url, max_comments=20):

    def get_video_id(url):
        parsed = urllib.parse.urlparse(url)
        if "youtube.com" in url:
            return dict(urllib.parse.parse_qsl(parsed.query)).get("v")
        elif "youtu.be" in url:
            return parsed.path.strip("/")
        return None

    video_id = get_video_id(url)
    if not video_id:
        return []

    api_key = Youtube_Api_Key
    youtube = build("youtube", "v3", developerKey=api_key)

    comments = []

    request = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=max_comments,
        textFormat="plainText"
    )

    response = request.execute()

    for item in response.get("items", []):
        snippet = item["snippet"]["topLevelComment"]["snippet"]

        comments.append({
            "text": snippet.get("textDisplay", ""),
            "author": snippet.get("authorDisplayName", "-"),
            "date": datetime.strptime(
                snippet.get("publishedAt"),
                "%Y-%m-%dT%H:%M:%SZ"
            ).strftime("%Y-%m-%d")
        })

    return comments

def get_tiktok_comments(url):

    try:
        video_id = url.split("/")[5].split("?")[0]

        response = requests.get(
            f"https://www.tiktok.com/api/comment/list/?aid=1988&aweme_id={video_id}&count=50",
            headers={"user-agent": "Mozilla/5.0"},
            timeout=10
        )

        data = response.json()

        comments = []

        for c in data.get("comments", []):
            comments.append({
                "text": c["text"],
                "author": c["user"]["unique_id"],
                "date": datetime.fromtimestamp(
                    int(c["create_time"])
                ).strftime("%Y-%m-%d")
            })

        return comments

    except Exception:
        return []

def analyze_comments(comments, url):

    conn = get_connection()
    cursor = conn.cursor()

    results = []
    summary = {label: 0 for label in LABELS}
    summary["Olumlu"] = 0

    for comment in comments:

        text = comment["text"]

        x = vectorizer.transform([text])
      
        pred = model.predict(x)[0]
 
        is_negative = False

        for i, label in enumerate(LABELS):
            if pred[i] > 0.5:
                is_negative = True
                summary[label] += 1

        final_result = "Olumsuz" if is_negative else "Olumlu"

        if not is_negative:
            summary["Olumlu"] += 1

        date = comment.get("date")
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")

        author = comment.get("author", "-")


        try:
            cursor.execute("""
                INSERT INTO Toxic
                (Url, Yorum, YorumSahibi, Sonuc, YayınlanmaTarih)
                VALUES (?, ?, ?, ?, ?)
            """,
            url,
            text,
            author,
            final_result,
            date
            )

        except pyodbc.IntegrityError:
            pass


        try:
            cursor.execute("""
                INSERT INTO Yorum
                (Yorum, Sonuc, İncelemeTarihi)
                VALUES (?, ?, ?)
            """,
            text,
            final_result,
            datetime.now()
            )

        except pyodbc.IntegrityError:
            pass

        try:
            cursor.execute("""
                INSERT INTO YorumTuru
                (Url, Yorum, toxic, nefret, mustehcen, tehtid, hakaret, kimliknefreti)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            url,
            text,
            int(pred[0] > 0.5),
            int(pred[1] > 0.5),
            int(pred[2] > 0.5),
            int(pred[3] > 0.5),
            int(pred[4] > 0.5),
            int(pred[5] > 0.5)
            )

        except pyodbc.IntegrityError:
            pass

        
        results.append({
    "text": text,
    "author": author,
    "final": final_result,

    "labels": {
        "nefret": int(pred[1] > 0.5),
        "mustehcen": int(pred[2] > 0.5),
        "tehtid": int(pred[3] > 0.5),
        "hakaret": int(pred[4] > 0.5),
        "kimliknefreti": int(pred[5] > 0.5),
    }
})

    conn.commit()
    conn.close()

    return {
        "total": len(comments),
        "summary": summary,
        "comments": results
    }

def save_url(url):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO UrlAdres (Url, date)
            VALUES (?, ?)
        """,
        url,
        datetime.now()
        )

        conn.commit()

    except pyodbc.IntegrityError:
        # duplicate → ignore
        pass

    finally:
        conn.close()
@app.post("/analyze")
def analyze(req: AnalyzeRequest):

    input_text  = req.input

    if "youtube.com" in input_text or "youtu.be" in input_text:
        save_url(input_text)
        comments = get_youtube_comments(input_text)
        return analyze_comments(comments, input_text)

    elif "tiktok.com" in input_text:
        save_url(input_text)
        comments = get_tiktok_comments(input_text)
        return analyze_comments(comments, input_text)

    return {
        "success": False,
        "message": "Sadece YouTube veya TikTok URL kabul edilir"
    }


@app.post("/contact")
def contact(req: ContactRequest):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO İletisim
            (isim, eposta, mesaj, tarih)
            VALUES (?, ?, ?, ?)
        """,
        req.name,
        req.email,
        req.message,
        datetime.now()
        )

        conn.commit()

        return {"success": True}

    except Exception as e:
        return {"success": False, "error": str(e)}

    finally:
        conn.close()
@app.get("/profile")
def profile():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT Url, date
        FROM UrlAdres
        ORDER BY date DESC
    """)

    rows = cursor.fetchall()

    urls = []
    for r in rows:
        urls.append({
            "Url": r[0],
            "date": str(r[1])
        })

    conn.close()

    return {
        "urls": urls
    }
@app.get("/user/email")
def get_user_email(username: str):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT email
            FROM [dbo].[Kullanıcı]
            WHERE kullanıcıadı = ?
        """, username)

        row = cursor.fetchone()

        if not row:
            return {
                "success": False,
                "message": "Kullanıcı bulunamadı"
            }

        return {
            "success": True,
            "email": row[0]
        }

    finally:
        conn.close()
@app.post("/user/update")
def update_user(req: dict):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE [dbo].[Kullanıcı]
        SET kullanıcıadı = ?, email = ?
        WHERE kullanıcıid = ?
    """,
    req["username"],
    req["email"],
    req["id"]
    )

    conn.commit()
    conn.close()

    return {"success": True}
@app.get("/admin/users")
def get_users():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT kullanıcıid, kullanıcıadı, email, isadmin FROM Kullanıcı")
    rows = cursor.fetchall()

    users = []
    for r in rows:
        users.append({
            "id": r[0],
            "username": r[1],
            "email": r[2],
            "isadmin": r[3]
        })

    conn.close()
    return {"users": users}
@app.get("/admin/comments")
def get_comments():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT Yorum, Sonuc FROM Yorum")
    rows = cursor.fetchall()

    comments = []
    for r in rows:
        comments.append({
            "text": r[0],
            "result": r[1]
        })

    conn.close()
    return {"comments": comments}
class UpdateUser(BaseModel):
    id: int
@app.post("/user/update")
async def update_user(data: dict):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE Kullanıcı
        SET isadmin = 1
        WHERE kullanıcıid = ?
    """, (data["id"],))

    conn.commit()

    return {"message": "Kullanıcı admin yapıldı"}
@app.delete("/user/delete/{user_id}")
async def delete_user(user_id: int):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM Kullanıcı
        WHERE kullanıcıid = ?
    """, (user_id,))

    conn.commit()

    return {"message": "Kullanıcı silindi"}
@app.get("/admin/comment-types")
def get_comment_types():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT Url, Yorum, toxic, nefret, mustehcen, tehtid, hakaret, kimliknefreti
        FROM YorumTuru
    """)

    rows = cursor.fetchall()

    result = []

    for r in rows:
        result.append({
            "url": r[0],
            "text": r[1],
            "toxic": r[2],
            "nefret": r[3],
            "mustehcen": r[4],
            "tehtid": r[5],
            "hakaret": r[6],
            "kimliknefreti": r[7],
        })

    conn.close()

    return {"types": result}

@app.get("/")
def root():
    return {"status": "ok"}