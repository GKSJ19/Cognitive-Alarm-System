from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Cognitive Alarm System API"}