from datetime import datetime, timezone
from typing import List
from sqlalchemy import DateTime, String, Text, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, base, mapped_column,relationship
class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True , index=True)
    name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(1000),  unique=True, nullable=False ,index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    sessions: Mapped[List["Chatsession"]] = relationship(back_populates="users", cascade="all, delete-orphan" )

class Chatsession(Base):
    __tablename__ = "chat_sessions"
    id: Mapped[int] = mapped_column(primary_key=True , index=True)
    userId: Mapped[int] = mapped_column(ForeignKey("users.id"))
    ticker: Mapped[str] = mapped_column(String(6), index=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime , default=lambda: datetime.now(timezone.utc))
    users: Mapped["User"] = relationship(back_populates="sessions")
    messages: Mapped[List["Messages"]] = relationship(back_populates="session", cascade="all, delete-orphan")

class Messages(Base):
    __tablename__ = "messages"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sessionId: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id"))
    content: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(10))
    session: Mapped["Chatsession"] = relationship(back_populates="messages")

