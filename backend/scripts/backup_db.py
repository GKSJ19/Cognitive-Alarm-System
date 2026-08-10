import os
import shutil
import logging
from datetime import datetime

# Configure a simple logger for the standalone script
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join("logs", "backup.log") if os.path.exists("logs") else "backup.log")
    ]
)

def backup_database():
    db_file = "cognitive_alarm.db"
    backup_dir = "backups"
    max_backups = 10
    
    if not os.path.exists(db_file):
        logging.error(f"Database file '{db_file}' not found in current directory. Backup cancelled.")
        return False
        
    os.makedirs(backup_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(backup_dir, f"backup_cognitive_alarm_{timestamp}.db")
    
    try:
        # Copy the sqlite database file
        shutil.copy2(db_file, backup_file)
        logging.info(f"Database backup created successfully: {backup_file}")
        
        # Clean up older backups if count exceeds max_backups
        backups = [os.path.join(backup_dir, f) for f in os.listdir(backup_dir) if f.startswith("backup_cognitive_alarm_") and f.endswith(".db")]
        backups.sort(key=os.path.getmtime)  # Sort oldest first
        
        if len(backups) > max_backups:
            to_remove = backups[:-max_backups]
            for file_path in to_remove:
                os.remove(file_path)
                logging.info(f"Pruned old backup file: {file_path}")
                
        return True
    except Exception as e:
        logging.error(f"An error occurred during database backup: {str(e)}")
        return False

if __name__ == "__main__":
    logging.info("Starting database backup process...")
    backup_database()
