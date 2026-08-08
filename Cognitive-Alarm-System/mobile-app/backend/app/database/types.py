"""Cross-dialect column types.

`sqlalchemy.dialects.postgresql.UUID` only works correctly against a real
Postgres database. This project runs on SQLite by default for local/dev use
(see `DATABASE_URL` in `.env`), and SQLite has no native UUID type, so the
Postgres-only column silently stores/reads UUIDs incorrectly and raises
`AttributeError: 'str' object has no attribute 'hex'` as soon as a UUID is
supplied as a plain string (e.g. a value decoded out of a JWT). `GUID` below
stores a real UUID on Postgres and a 32-char hex string on every other
backend (SQLite included), while always returning `uuid.UUID` objects to
Python code.
"""
import uuid

from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import CHAR, TypeDecorator


class GUID(TypeDecorator):
    """Platform-independent UUID type.

    Uses PostgreSQL's native UUID type when available, otherwise stores as a
    stringified hex CHAR(32).
    """

    impl = CHAR
    cache_ok = True

    def __init__(self, *args, **kwargs):
        # Accept (and ignore) the postgresql.UUID-style `as_uuid` kwarg so
        # this is a drop-in replacement for `UUID(as_uuid=True)` call sites.
        kwargs.pop("as_uuid", None)
        super().__init__()

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return str(value)
        if not isinstance(value, uuid.UUID):
            value = uuid.UUID(str(value))
        return value.hex

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)
