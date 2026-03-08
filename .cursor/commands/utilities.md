# Utility Commands

## 🧹 Cleanup Commands

### Clean Node Modules
```bash
rm -rf node_modules
npm install
```

### Clean Build Files
```bash
rm -rf dist
npm run build
```

### Clean Test Coverage
```bash
rm -rf coverage
npm run test:cov
```

### Clean Logs
```bash
rm -rf logs/*
```

### Clean Temporary Files
```bash
find . -name "*.tmp" -delete
find . -name "*.log" -delete
```

### Clean Docker Images
```bash
docker system prune -a
```

### Clean Docker Volumes
```bash
docker volume prune
```

## 📦 Package Management

### Install Dependencies
```bash
npm install
```

### Install Production Dependencies Only
```bash
npm install --production
```

### Install Development Dependencies
```bash
npm install --dev
```

### Update Dependencies
```bash
npm update
```

### Update Specific Package
```bash
npm update package-name
```

### Install Global Package
```bash
npm install -g package-name
```

### Uninstall Package
```bash
npm uninstall package-name
```

### Check Outdated Packages
```bash
npm outdated
```

### Audit Dependencies
```bash
npm audit
```

### Fix Security Issues
```bash
npm audit fix
```

### Force Fix Security Issues
```bash
npm audit fix --force
```

## 🔧 Git Commands

### Initialize Git Repository
```bash
git init
```

### Add All Files
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Your commit message"
```

### Push to Remote
```bash
git push origin main
```

### Pull Latest Changes
```bash
git pull origin main
```

### Create New Branch
```bash
git checkout -b feature/new-feature
```

### Switch Branch
```bash
git checkout main
```

### Merge Branch
```bash
git merge feature/new-feature
```

### Delete Branch
```bash
git branch -d feature/new-feature
```

### View Git Status
```bash
git status
```

### View Git Log
```bash
git log --oneline
```

### View Git Diff
```bash
git diff
```

### Stash Changes
```bash
git stash
```

### Apply Stash
```bash
git stash pop
```

## 🔍 File Operations

### Find Files by Name
```bash
find . -name "*.ts" -type f
```

### Find Files by Content
```bash
grep -r "search-term" .
```

### Find Large Files
```bash
find . -type f -size +10M
```

### Count Lines in Files
```bash
find . -name "*.ts" -exec wc -l {} +
```

### Find Empty Files
```bash
find . -type f -empty
```

### Find Duplicate Files
```bash
find . -type f -exec md5sum {} + | sort | uniq -d -w 32
```

### Remove Empty Directories
```bash
find . -type d -empty -delete
```

### Backup Directory
```bash
cp -r src src-backup-$(date +%Y%m%d)
```

### Compress Directory
```bash
tar -czf backup.tar.gz src/
```

### Extract Archive
```bash
tar -xzf backup.tar.gz
```

## 🌐 Network Utilities

### Check Port Availability
```bash
netstat -tulpn | grep :3000
```

### Test Network Connectivity
```bash
ping google.com
```

### Check DNS Resolution
```bash
nslookup google.com
```

### Test HTTP Connection
```bash
curl -I http://localhost:3000
```

### Download File
```bash
curl -O https://example.com/file.zip
```

### Upload File
```bash
curl -X POST -F "file=@local-file.zip" http://localhost:3000/upload
```

### Monitor Network Traffic
```bash
tcpdump -i lo port 3000
```

### Check SSL Certificate
```bash
openssl s_client -connect example.com:443
```

## 🔐 Security Utilities

### Generate Random Password
```bash
openssl rand -base64 32
```

### Generate UUID
```bash
uuidgen
```

### Hash Password
```bash
echo -n "password" | sha256sum
```

### Generate SSH Key
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

### Check File Permissions
```bash
ls -la
```

### Change File Permissions
```bash
chmod 755 script.sh
```

### Change File Ownership
```bash
chown user:group file.txt
```

### Check SSL Certificate Expiry
```bash
echo | openssl s_client -servername example.com -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

## 📊 System Information

### Check System Info
```bash
uname -a
```

### Check CPU Info
```bash
lscpu
```

### Check Memory Info
```bash
free -h
```

### Check Disk Usage
```bash
df -h
```

### Check Directory Size
```bash
du -sh *
```

### Check Process Info
```bash
ps aux | grep node
```

### Check System Load
```bash
uptime
```

### Check Network Interfaces
```bash
ip addr show
```

### Check Environment Variables
```bash
env | grep NODE
```

### Check Node Version
```bash
node --version
```

### Check NPM Version
```bash
npm --version
```

## 🚀 Performance Utilities

### Monitor CPU Usage
```bash
top -p $(pgrep -f "node.*main")
```

### Monitor Memory Usage
```bash
ps aux | grep node
```

### Profile Node Application
```bash
node --prof dist/main.js
```

### Analyze Profile
```bash
node --prof-process isolate-*.log
```

### Check Memory Leaks
```bash
node --expose-gc --inspect dist/main.js
```

### Monitor File Descriptors
```bash
lsof -p $(pgrep -f "node.*main")
```

### Check Network Connections
```bash
netstat -an | grep :3000
```

### Monitor Disk I/O
```bash
iostat -x 1
```

### Check System Load
```bash
sar -u 1 5
```
