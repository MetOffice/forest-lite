"""Fake user database support"""
import os
import yaml
from passlib.context import CryptContext

DB_FILE = os.getenv("DB_FILE")

context = CryptContext(schemes=["bcrypt"], deprecated=["auto"])


def verify_password(plain_password, hashed_password):
    return context.verify(plain_password, hashed_password)


def hash_password(password):
    return context.hash(password)


def get_users_db():
    """Callback to access user records"""
    # TODO: Load from disk
    with open(DB_FILE) as stream:
        data = yaml.safe_load(stream)
    return data


def save_user(user_name, password, db_file, user_group="anonymous"):
    # TODO: Replace with a proper secure database
    try:
        with open(db_file) as stream:
            data = yaml.safe_load(stream)
    except FileNotFoundError:
        data = {}

    data[user_name] = {
        "username": user_name,
        "full_name": user_name,
        "group": user_group,
        "email": "example@example.com",
        "hashed_password": hash_password(password),
        "disabled": False,
    }

    with open(db_file, "w") as stream:
        yaml.dump(data, stream)
