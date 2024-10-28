from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from chatbot import CafeKioskChatbot

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 챗봇 인스턴스 생성
chatbot = CafeKioskChatbot()

class Message(BaseModel):
    content: str

class MenuItem(BaseModel):
    name: str
    quantity: int
    price: float
    options: Optional[dict] = None

@app.post("/chat")
async def chat(message: Message):
    try:
        response = await chatbot.get_response(message.content)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/menu/price")
async def get_price(menu: MenuItem):
    try:
        price = await chatbot.get_menu_price(menu.name)
        if price is None:
            raise HTTPException(status_code=404, detail="Menu not found")
        return {"price": price}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def read_root():
    return {"message": "Welcome to Cafe Kiosk API"}