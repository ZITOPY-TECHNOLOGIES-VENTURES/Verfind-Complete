@echo off
cd /d "c:\Users\Zima\OneDrive\Verifind-Complete"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "feat: migrate to PostgreSQL Prisma 6, switch email to Brevo, fix all Mongoose refs"
"C:\Program Files\Git\cmd\git.exe" remote set-url origin https://github.com/ZITOPY-TECHNOLOGIES-VENTURES/Verfind-Complete.git
"C:\Program Files\Git\cmd\git.exe" push
echo Done!
pause
