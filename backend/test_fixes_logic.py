
import re

def test_cors_logic(origin):
    allowed_origins = ["https://app-barber-iota.vercel.app"]
    allow_origin_regex = r"https://.*\.vercel\.app"
    
    if origin in allowed_origins:
        return True
    if re.fullmatch(allow_origin_regex, origin):
        return True
    return False

def test_db_url_logic(url):
    if url.startswith("postgresql") and "sslmode" not in url:
        separator = "&" if "?" in url else "?"
        url += f"{separator}sslmode=require"
    return url

# Testes
print("--- Teste CORS ---")
print(f"app-barber-iota.vercel.app: {test_cors_logic('https://app-barber-iota.vercel.app')}")
print(f"preview-deploy.vercel.app: {test_cors_logic('https://preview-deploy.vercel.app')}")
print(f"random-site.com: {test_cors_logic('https://random-site.com')}")

print("\n--- Teste DB URL ---")
print(f"Simple URL: {test_db_url_logic('postgresql://user:pass@host/db')}")
print(f"URL with params: {test_db_url_logic('postgresql://user:pass@host/db?param=1')}")
print(f"URL already has sslmode: {test_db_url_logic('postgresql://user:pass@host/db?sslmode=verify-full')}")
print(f"SQLite: {test_db_url_logic('sqlite:///./test.db')}")
