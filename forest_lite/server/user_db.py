"""Fake user database support"""
from passlib.context import CryptContext


context = CryptContext(schemes=["bcrypt"], deprecated=["auto"])


def verify_password(plain_password, hashed_password):
    return context.verify(plain_password, hashed_password)


def hash_password(password):
    return context.hash(password)


def get_users_db():
    """Callback to access user records"""
    return {
        "johndoe": {
            "username": "johndoe",
            "full_name": "John Doe",
            "group": "highway",
            "email": "johndoe@example.com",
            "hashed_password": hash_password("secret"),
            "disabled": False,
        },
        "alice": {
            "username": "alice",
            "full_name": "Alice",
            "group": "wcssp",
            "email": "alice@example.com",
            "hashed_password": hash_password("secret2"),
            "disabled": False,
        },
        "bob": {
            "username": "bob",
            "full_name": "Bob",
            "group": "guest",
            "email": "bob@example.com",
            "hashed_password": hash_password("anonymous"),
            "disabled": False,
        }
    }
