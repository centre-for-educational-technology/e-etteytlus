Deployment:

1. Copy all files into a PHP directory
2. Rename "htaccess" to ".htaccess" (if applicable) github doesn't allow .htaccess to be uploaded)
3. Configure "config.php"
4. Execute "deploy.php", if deployment fails, manually delete the created database (if any) before retry
note: After deployment, "deploy.php" cannot be used to attack the program, however it can be deleted if you like


Usage:

1. /user.html or root is used to access the test performer side
2. /conductor.html or /conductor or /admin is used to access the conductor / administrator side