from __future__ import annotations

import hashlib
import hmac
import os


ITERATIONS = 120000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS)
    return f"{salt.hex()}${derived.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        salt_hex, hash_hex = password_hash.split("$", 1)
    except ValueError:
        return False
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt_hex),
        ITERATIONS,
    )
    return hmac.compare_digest(derived.hex(), hash_hex)
