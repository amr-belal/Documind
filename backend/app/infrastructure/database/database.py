from sqlalchemy.ext.asyncio import create_async_engine , AsyncSession , async_sessionmaker
from backend.config import DATABASE_URL

# Create an asynchronous engine
class Database:
    def __init__(self):
        self.engine = create_async_engine(DATABASE_URL, echo=False)
        self.async_session = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )

    async def get_db(self):
        async with self.async_session() as session:
            yield session
