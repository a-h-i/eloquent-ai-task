import json
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import Depends, FastAPI
from psycopg import AsyncConnection
from pydantic import BaseModel
from starlette.responses import StreamingResponse

from server.ai.db import get_connection, pool
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


class ServerSentEvent(BaseModel):
    data: str
    event: str | None = None
    id: int | None = None
    retry: int | None = None

    def encode(self) -> bytes:
        message = f"data: {self.data}"
        if self.event is not None:
            message = f"{message}\nevent: {self.event}"
        if self.id is not None:
            message = f"{message}\nid: {self.id}"
        if self.retry is not None:
            message = f"{message}\nretry: {self.retry}"
        message = f"{message}\n\n"
        return message.encode("utf-8")


@app.get("/chatbot")
async def chatbot(thread_id: str, message: str, conn: Annotated[AsyncConnection, Depends(get_connection)]):
    async def stream_response() -> AsyncGenerator[bytes, Any]:
        graph = await build_graph(conn)
        payload = {"event": "assistant_stream_start"}
        sse = ServerSentEvent(data=json.dumps(payload))
        yield sse.encode()
        async for message_chunk, metadata in graph.astream(
            {
                "messages": [{"role": "user", "content": message}],
            },
            config={"thread_id": thread_id},
            stream_mode="messages",
        ):
            if "assistant" in metadata["tags"]:
                payload = {"event": "assistant_token", "data": message_chunk.content}
                sse = ServerSentEvent(data=json.dumps(payload))
                yield sse.encode()
        payload = {"event": "assistant_stream_end"}
        sse = ServerSentEvent(data=json.dumps(payload))
        yield sse.encode()

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Transfer-Encoding": "chunked",
            "X-Accel-Buffering": "no",
        },
    )
