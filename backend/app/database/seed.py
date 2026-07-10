import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.role import Role
from app.models.user import User
from app.models.profile import UserProfile

logger = logging.getLogger("app.seed")


async def seed_data(session: AsyncSession) -> None:
    """Seed default roles, admin user, and demo user on first startup."""

    # ── Seed default roles ──────────────────────────────────────────
    default_roles = [
        {"name": "admin", "description": "Administrator with full platform control"},
        {"name": "user", "description": "Regular user with habit tracking and alarms access"},
        {"name": "coach", "description": "Wellness coach who can view client metrics"},
    ]

    role_map: dict[str, Role] = {}
    for role_data in default_roles:
        result = await session.execute(
            select(Role).where(Role.name == role_data["name"])
        )
        existing_role = result.scalar_one_or_none()
        if not existing_role:
            role = Role(name=role_data["name"], description=role_data["description"])
            session.add(role)
            role_map[role_data["name"]] = role
            logger.info("Created role: %s", role_data["name"])
        else:
            role_map[role_data["name"]] = existing_role

    await session.flush()

    # ── Seed default admin user ─────────────────────────────────────
    admin_email = "admin@icap.dev"
    result = await session.execute(select(User).where(User.email == admin_email))
    admin_user = result.scalar_one_or_none()

    if not admin_user:
        admin_role = role_map.get("admin")
        admin_user = User(
            email=admin_email,
            hashed_password=get_password_hash("Admin@123"),
            full_name="Platform Admin",
            is_active=True,
            is_superuser=True,
            role_id=admin_role.id if admin_role else None,
        )
        session.add(admin_user)
        await session.flush()

        profile = UserProfile(user_id=admin_user.id)
        session.add(profile)
        logger.info("Created admin user: %s", admin_email)

    # ── Seed demo user ──────────────────────────────────────────────
    demo_email = "demo@icap.dev"
    result = await session.execute(select(User).where(User.email == demo_email))
    demo_user = result.scalar_one_or_none()

    if not demo_user:
        user_role = role_map.get("user")
        demo_user = User(
            email=demo_email,
            hashed_password=get_password_hash("Demo@123"),
            full_name="Demo User",
            is_active=True,
            is_superuser=False,
            role_id=user_role.id if user_role else None,
        )
        session.add(demo_user)
        await session.flush()

        profile = UserProfile(user_id=demo_user.id)
        session.add(profile)
        logger.info("Created demo user: %s", demo_email)

    await session.commit()
