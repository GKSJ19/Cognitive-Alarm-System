import asyncio
from sqlalchemy.future import select
from sqlalchemy import text
from app.database.connection import engine, Base, AsyncSessionLocal
from app.models.user_model import User
from app.models.coach_model import CoachAssignment
from app.services.admin_service import AdminService
from app.services.coach_service import CoachService

async def test_admin_coach_system():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        try:
            await conn.execute(text("ALTER TABLE coach_assignments ADD COLUMN assigned_by_admin VARCHAR(36)"))
        except Exception:
            pass

    async with AsyncSessionLocal() as db:
        # Create test users if not exist
        # 1. Admin
        admin_res = await db.execute(select(User).where(User.email == "test_admin@icap.com"))
        admin = admin_res.scalars().first()
        if not admin:
            admin = User(email="test_admin@icap.com", full_name="Test Admin", role="admin", is_active=True, is_verified=True)
            db.add(admin)

        # 2. Coach A
        coach_a_res = await db.execute(select(User).where(User.email == "coach_a@icap.com"))
        coach_a = coach_a_res.scalars().first()
        if not coach_a:
            coach_a = User(email="coach_a@icap.com", full_name="Coach Alpha", role="coach", is_active=True, is_verified=True)
            db.add(coach_a)

        # 3. Coach B
        coach_b_res = await db.execute(select(User).where(User.email == "coach_b@icap.com"))
        coach_b = coach_b_res.scalars().first()
        if not coach_b:
            coach_b = User(email="coach_b@icap.com", full_name="Coach Beta", role="coach", is_active=True, is_verified=True)
            db.add(coach_b)

        # 4. User 1
        u1_res = await db.execute(select(User).where(User.email == "user1@icap.com"))
        u1 = u1_res.scalars().first()
        if not u1:
            u1 = User(email="user1@icap.com", full_name="User One", role="user", is_active=True, is_verified=True)
            db.add(u1)

        # 5. User 2
        u2_res = await db.execute(select(User).where(User.email == "user2@icap.com"))
        u2 = u2_res.scalars().first()
        if not u2:
            u2 = User(email="user2@icap.com", full_name="User Two", role="user", is_active=True, is_verified=True)
            db.add(u2)

        await db.commit()
        await db.refresh(admin)
        await db.refresh(coach_a)
        await db.refresh(coach_b)
        await db.refresh(u1)
        await db.refresh(u2)

        # Test 1: Assign Coach A to User 1
        assign1 = await AdminService.assign_coach(db, coach_a.id, u1.id, admin.id)
        assert assign1.coach_id == coach_a.id
        assert assign1.user_id == u1.id

        # Test 2: Check Coach A can access User 1 analytics (RBAC pass)
        can_access_u1 = await CoachService.verify_coach_access(db, coach_a.id, u1.id)
        assert can_access_u1 is True

        # Test 3: Check Coach B CANNOT access User 1 analytics (RBAC deny)
        can_access_u1_by_b = await CoachService.verify_coach_access(db, coach_b.id, u1.id)
        assert can_access_u1_by_b is False

        # Test 4: Reassign User 1 to Coach B
        reassign = await AdminService.assign_coach(db, coach_b.id, u1.id, admin.id)
        assert reassign.coach_id == coach_b.id

        # Check access after reassignment
        assert await CoachService.verify_coach_access(db, coach_b.id, u1.id) is True
        assert await CoachService.verify_coach_access(db, coach_a.id, u1.id) is False

        # Test 5: Unassign User 1
        unassign = await AdminService.remove_coach_assignment(db, u1.id)
        assert unassign is True
        assert await CoachService.verify_coach_access(db, coach_b.id, u1.id) is False

        # Test 6: Verify Admin Dashboard Overview Data
        overview = await AdminService.get_admin_dashboard_overview(db)
        assert "overview_cards" in overview
        assert "charts" in overview
        assert "recent_activities" in overview

        print("All Admin & Coach DB/RBAC/Assignment unit tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(test_admin_coach_system())
