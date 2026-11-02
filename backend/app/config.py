"""Environment-driven settings shared across the app.

Read once, here, with a working local default for each -- the platform
injects the real values as environment variables in every deployed
environment; nothing else has to change. `main.py` already reads
`ALLOWED_ORIGINS` directly for the CORS middleware, so it is not repeated
here.

Neither constant below is wired into a request handler yet: issuing and
validating session tokens is the development sprint's work (US-001, US-002).
This module exists so that work reads the signing key the same way, rather
than each router inventing its own `os.getenv` call.
"""

import os

# Signs and validates session tokens (JWT). Private -- never send this to the
# frontend and never use it to validate the shared bearer below. At least 32
# bytes so PyJWT does not warn that the HMAC key is below the minimum
# recommended length for HS256.
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me-please-32bytes")

# The shared bearer every request from the generated frontend carries (see
# frontend/src/lib/api.ts). Public by design: it identifies the known
# frontend build, not a logged-in user, so it must never be used to sign
# anything -- that is what JWT_SECRET_KEY is for.
SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-me")

__all__ = ["JWT_SECRET_KEY", "SECRET_KEY"]
