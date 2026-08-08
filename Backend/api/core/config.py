from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    DB_HOST: str = "postgres"
    DB_PORT: int = 5432
    DB_NAME: str = "puravida"
    DB_USER: str = "puravida"
    DB_PASSWORD: str = "changeme"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    model_config = {"env_file": "../.env", "extra": "ignore"}


settings = Settings()
