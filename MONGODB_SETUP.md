# MongoDB Local Setup Guide

## Installation Instructions

### For Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service (recommended)
5. Install MongoDB Compass (GUI tool) when prompted

### For macOS:
```bash
# Using Homebrew (recommended)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

### For Linux (Ubuntu/Debian):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Verification Steps

1. **Check if MongoDB is running:**
   ```bash
   # On Windows (Command Prompt or PowerShell)
   net start | findstr MongoDB
   
   # On macOS/Linux
   brew services list | grep mongodb  # macOS
   sudo systemctl status mongod       # Linux
   ```

2. **Test MongoDB connection:**
   ```bash
   # Open MongoDB shell
   mongosh
   
   # Or if using older version
   mongo
   ```

3. **Create the database (optional - will be created automatically):**
   ```javascript
   // In MongoDB shell
   use housing-clone
   db.test.insertOne({message: "Hello Housing Clone!"})
   db.test.find()
   ```

## Configuration

The application is configured to connect to:
- **Host:** localhost
- **Port:** 27017 (default)
- **Database:** housing-clone

## Troubleshooting

### Common Issues:

1. **Port 27017 already in use:**
   ```bash
   # Find process using port 27017
   netstat -ano | findstr :27017  # Windows
   lsof -i :27017                 # macOS/Linux
   
   # Kill the process if needed
   taskkill /PID <PID> /F         # Windows
   kill -9 <PID>                  # macOS/Linux
   ```

2. **MongoDB service not starting:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services restart mongodb/brew/mongodb-community
   
   # Linux
   sudo systemctl restart mongod
   ```

3. **Permission issues (Linux/macOS):**
   ```bash
   # Fix data directory permissions
   sudo chown -R mongodb:mongodb /var/lib/mongodb
   sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
   ```

## MongoDB Compass (GUI Tool)

Download MongoDB Compass for a visual interface:
https://www.mongodb.com/products/compass

Connection string: `mongodb://localhost:27017`

## Next Steps

1. Ensure MongoDB is running
2. Update the `.env` file with your Cloudinary credentials
3. Start the backend server: `npm run dev`
4. The application will automatically create the necessary collections

## Sample Data

Once the application is running, you can:
1. Register as a property owner
2. Add sample properties
3. View them in MongoDB Compass or shell

The application will automatically create these collections:
- `users` - User accounts and authentication
- `properties` - Property listings with all details