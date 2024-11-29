import secrets
import base64

# Generar una clave secreta segura de 32 bytes (256 bits)
secret_key = secrets.token_urlsafe(32)

print("Tu clave secreta generada es:")
print(secret_key)
print("\nCopia esta clave y úsala en tu archivo .env como:")
print(f"SECRET_KEY={secret_key}") 