from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Domineeds"
    PROJECT_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "yoursecretkeyhere"
    ALGORITHM: str = "HS256"
    # 60 * 24 * 8 = 11520 (8 days)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520
    
    DATABASE_URL: Optional[str] = "sqlite:///./sql_app.db"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
