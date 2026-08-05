import sys
from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared limiter instance -- imported by main.py (to register it on the app)
# and by any route that needs @limiter.limit(...).
#
# enabled=False under pytest: the test suite legitimately registers/logs in
# far more than a real user would in a minute, across many test functions
# sharing one client "IP". Rate limiting is a production concern, not
# something the test suite itself should be constrained by.
limiter = Limiter(
    key_func=get_remote_address,
    enabled="pytest" not in sys.modules,
)
