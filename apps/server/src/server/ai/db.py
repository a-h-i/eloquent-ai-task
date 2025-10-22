from psycopg_pool import AsyncConnectionPool

from server.ai.config import settings

pool = AsyncConnectionPool(
    conninfo=f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}",
    open=False,

)



async def get_connection():
    async with pool.connection() as conn:
        yield conn