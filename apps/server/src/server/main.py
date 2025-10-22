from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, Depends
from psycopg import AsyncConnection

from server.ai.db import pool, get_connection
from server.ai.graph import build_graph


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await pool.open()
    yield
    await pool.close()


app = FastAPI(
    lifespan=lifespan,
    title="Chatbot API",
    description="API for interacting with a chatbot",
    version="0.1.0",
)



@app.get("/chatbot")
async def chatbot(thread_id: str, message: str, conn: Annotated[AsyncConnection, Depends(get_connection)]):
    graph = await build_graph(conn)
    response = await graph.ainvoke(
        {
            "messages": [{"role": "user", "content": message}],
        },
        config={"thread_id": thread_id},
    )
    return response
