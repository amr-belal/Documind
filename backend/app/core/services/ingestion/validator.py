from app.core.enums.file_type import FileType
from config import MAX_FILE_SIZE

class ValidateFile:
    def __init__(self , file):
        self.file = file
    
    def validate_extension(self):
        """ validate the file extension against allowed file types.
        """
        
        file_extension = self.file.filename.split(".")[-1].lower()
        allowed_extensions = [file_type.value for file_type in FileType]
        
        if file_extension not in allowed_extensions:
            raise ValueError(f"Unsupported file type: {file_extension}. Allowed types are: {', '.join(allowed_extensions)}")
        
        return file_extension
    
    def validate_size(self ):
        """ validate the file size against allowed size.
        """
        
        file_size = self.file.size
        max_size = MAX_FILE_SIZE  # Use the global configuration value
        
        if file_size > max_size:
            raise ValueError(f"File size exceeds {max_size // (1024 * 1024)} MB")
        
        
        
    def validate (self):
        """ Perform all validations on the file.
        """
        extension =self.validate_extension()
        self.validate_size()
        return extension
    