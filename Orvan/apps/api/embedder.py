from google import genai
from .config import settings
gclient = genai.Client(api_key = settings.GEMINI)
def emSession():
    yield gclient
    