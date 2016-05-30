# E-etteütlus

E-etteütlus on veebipõhine rakendus etteütluste läbiviimiseks. Rakenduse abil saab haldusliideses lisada ja hallata etteütluseste alustekste ning näha tulemusi ning avalikus vaates sooritada e-etteütluseid.

## Server requirements:

1. PHP 5.6+, PHP 7.0 recommended
2. MySql 5.0+

## Deployment:

1. Copy all files into a PHP directory
2. Make sure that .htaccess file is still present after copying
  * Make sure that rewrite_engine is on
  * Check if RewriteBase has to be configured if running from subdirectory
3. Configure "config.php"
4. Execute "deploy.php", if deployment fails, manually delete the created database (if any) before retry
  * Note: After deployment, "deploy.php" cannot be used to attack the program, however it can be deleted if you like


## Usage:

1. /user.html or root is used to access the test performer side
2. /conductor.html or /conductor or /admin is used to access the conductor / administrator side

## Version

1.0.0
