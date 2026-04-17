from sqlalchemy.ext.asyncio import create_async_engine , AsyncSession , async_sessionmaker
from config import DATABASE_URL

# Create an asynchronous engine
# singleton pattern for database connection 
class Database:
    _instance = None 
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.engine = create_async_engine(DATABASE_URL, echo=False)
            self.async_session = async_sessionmaker(
                bind=self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            self.__class__._initialized = True

    async def get_db(self):
        async with self.async_session() as session:
            yield session


db = Database()
get_db = db.get_db