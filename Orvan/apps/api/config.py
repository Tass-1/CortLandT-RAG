from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DB : str
    API : str
    GEMINI: str
    MONGODB_URI: str
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()