from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DB : str
    API : str
    GEMINI: str
    MONGODB_URI: str
    POSTGRES: str
    model_config = SettingsConfigDict(env_file=".env")
    JWT_KEY: str
    JWT_ALGO: str

settings = Settings()