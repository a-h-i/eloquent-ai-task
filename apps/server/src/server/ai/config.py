from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    OLLAMA_HOST: str
    PINECONE_ENDPOINT: str
    PINECONE_API_KEY: str
    PINECONE_INDEX: str


settings = Settings()