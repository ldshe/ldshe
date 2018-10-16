# Learning Design Studio v2

All rewriting codes will be placed in **_ldsv2_** folder. The original **_lds_** folder is remained to serve the code change tracking purpose.

#### Installation with CentOS 6
**Upgrade the httpd 2.2 to 2.4:**

```
$ chkconfig httpd off
$ yum remove httpd
$ yum install centos-release-scl
$ yum --enablerepo=centos-sclo-rh -y install httpd24 httpd24-mod_ssl
$ scl enable httpd24 bash
$ chkconfig httpd24-httpd on
$ service httpd24-httpd start
```

**Install required PHP extensions:**

```
$ yum --enablerepo=centos-sclo-rh -y install \
      rh-php56 \
      rh-php56-php \
      rh-php56-php-pdo \
      rh-php56-php-mysql \
      rh-php56-php-mbstring \
      rh-php56-php-opcache
```

If **php** is previously installed in the system, you may need to remove them to avoid any conflict with **SCL** packages:
```
$ yum remove php php-*
```

**Modify php.ini:**

`php.ini` locates at `/etc/opt/rh/rh-php56`

```
session.gc_maxlifetime = 10800
session.cookie_secure = 1
session.cookie_httponly = 1
upload_max_filesize = 50M
post_max_size = 55M
```

**Rebuild symbolic links for easy access**
```
$ ln -s /opt/rh/httpd24/root/usr/sbin/httpd /usr/sbin/httpd
$ ln -s /opt/rh/httpd24/root/etc/httpd/ /etc/httpd
$ ln -s /etc/init.d/httpd24-httpd /etc/init.d/httpd
$ ln -s /opt/rh/rh-php56/root/usr/bin/php /usr/bin/php
```

The **WEBTATIC** packages only support httpd 2.2 so it would not work for version 2.4
```
### For httpd 2.2 only ###
$ rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-6.noarch.rpm
$ rpm -Uvh https://mirror.webtatic.com/yum/el6/latest.rpm
$ yum install -y php56w \
                 php56w-pdo \
                 php56w-mysql \
                 php56w-mbstring \
                 php56w-xml \
                 php56w-opcache \
                 php56w-process \
                 php56w-cli \
                 php56w-common
```

**Install Redis:**
```
$ yum install redis -y
$ chkconfig redis on
$ service redis start
```

Edit /etc/redis.conf file to change the password
```
requirepass your_redis_password
```

**Install Supervisor:**
```
$ yum install supervisor -y
$ chkconfig supervisord on
$ service supervisord start
```

**Install Composer:**
```
$ curl -k -sS https://getcomposer.org/installer | php
$ mv composer.phar /usr/local/bin/composer
```

**Install Node v8 with NPM v5 included:** (NPM v5 introduces the [**lockfiles**](https://docs.npmjs.com/files/package-locks) which can pin the installed packages to exact version.)
```
$ curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
$ yum -y install nodejs
```

**Other system libraries:**

The following libraries will be required when running npm install
```
$ yum -y install libpng-devel nasm
```

**Configuration for Lumen:**

Apache configuration for the Lumen API: (This provides only a minimum configuration requirements for the API routing. Please enhance it if necessary.)
```xml
<VirtualHost *:80>
    DocumentRoot /app_root_directory
    ...
	Alias /api /app_root_directory/api/public
	<Directory /app_root_directory/api/public>
		AllowOverride All
	</Directory>
</VirtualHost>
```

The Lumen API also supports jobs scheduling in programmatically way, add the following job to system cron before it works:
```sh
* * * * * /usr/bin/php /app_root_directory/api/artisan schedule:run >> /dev/null 2>&1
```

Supervisor configuration for the Lumen Queue worker:

Edit /etc/supervisord.conf file
```
[program:lumen-queue]
process_name=%(program_name)s_%(process_num)02d
command=/usr/bin/php /app_root_directory/api/artisan queue:work
autostart=true
autorestart=true
user=apache
numprocs=1
logfile=/var/log/supervisor/lumen-queue.log
```

**Configuration for Laravel Echo Server:**

Apache configuration for the Echo Server: (This provides only a minimum configuration requirements for the socket.io proxy pass-through. Please enhance it if necessary.)
```xml
<VirtualHost *:80>
    DocumentRoot /app_root_directory
    ...

    RewriteEngine On
    RewriteCond %{REQUEST_URI}  ^/socket.io            [NC]
    RewriteCond %{QUERY_STRING} transport=websocket    [NC]
    RewriteRule /(.*)           ws://localhost:6001/$1 [P,L]

    ProxyRequests off
	ProxyPass        /socket.io http://localhost:6001/socket.io
    ProxyPassReverse /socket.io http://localhost:6001/socket.io
</VirtualHost>
```

Supervisor configuration for the Echo server:

Edit /etc/supervisord.conf file

```
[program:echo-server]
process_name=%(program_name)s_%(process_num)02d
command=/usr/bin/npm run --prefix /app_root_directory/echo start
autostart=true
autorestart=true
user=apache
numprocs=1
logfile=/var/log/supervisor/echo-server.log
```

**Increase the size of file descriptors to handle long lasting websockets:**
```
$ ulimit -n 99999
$ sysctl -w fs.file-max=100000
```

Also edit the system files in order to make the settings last for next system reboot:

Edit /etc/security/limits.conf
```
* soft nofile 99999
* hard nofile 99999
```

Edit /etc/sysctl.conf
```
fs.file-max=100000
```

**.env files:**

Create **.env** files in ***/app_root_directory/api***, ***/app_root_directory/echo***, ***/app_root_directory/ldsv2*** and ***/app_root_directory/users*** respectively to specify the DB connections as well as other environment variables. **.env.example** files are included for reference.


**Install php or js libraries to the project folder:**

To ensure newly added libraries are installed in the project folder, execute the following commands before start working: (If the build failed messages appeared when running the **npm install** command, it may be the case that the building tools are not installed in the system, simply run **yum -y groupinstall "Development Tools"** and try again.)

```
$ cd api
$ composer install

$ cd echo
$ npm install

$ cd ldsv2
$ composer install
$ npm install

$ cd users
$ composer install
```

**Update db tables:**

If any **ldshe** prefixed tables are created or altered, run the following migration commands to take effect:

```
$ cd api
$ php artisan migrate
```

**Recompile the static assets:**

To bundle static assets, run the following commands:

```
$ cd ldsv2
$ npm run watch
```

Other commands are available in **_ldsv2/package.json_** under the **scripts** section.
```javascript
"scripts": {
  "dev": "NODE_ENV=development webpack --progress --hide-modules --config=webpack.config.js",
  "watch": "NODE_ENV=development webpack --watch --progress --hide-modules --config=webpack.config.js",
  "hot": "NODE_ENV=development webpack-dev-server --inline --hot --config=webpack.config.js",
  "production": "NODE_ENV=production webpack --progress --hide-modules --config=webpack.config.js"
},
```

The resulting assets will be output to **_ldsv2/dist_** folder.

#### Page URLs
* [My Designs: /ldsv2/design.php](/ldsv2/design.php)
* [Public Designs: /ldsv2/design.php#/public](/ldsv2/design.php#/public)
* [Public Designs (managed by Curator): /ldsv2/design.php#/curated](/ldsv2/design.php#/curated)
* [Shared Designs: /ldsv2/design.php#/shared](/ldsv2/design.php#/shared)
* [Contribution Requests for Designs: /ldsv2/design.php#/contributed](/ldsv2/design.php#/contributed)
* [New Design: /ldsv2/design.php#/create](/ldsv2/design.php#/create)
* [Edit a Design: /ldsv2/design.php#/edit/{id}](/ldsv2/design.php#/edit/{id})
* [Preview a Design: /ldsv2/design.php#/preview/{id}](/ldsv2/design.php#/preview/{id})
* [Print a Design: /ldsv2/design.php#/printable/{id}](/ldsv2/design.php#/printable/{id})
* [My Patterns: /ldsv2/design.php#/pattern](/ldsv2/design.php#/pattern)
* [Public Patterns: /ldsv2/design.php#/pattern/public](/ldsv2/design.php#/pattern/public)
* [Public Patterns (managed by Curator): /ldsv2/design.php#/pattern/curated](/ldsv2/design.php#/pattern/curated)
* [Shared Patterns: /ldsv2/design.php#/pattern/shared](/ldsv2/design.php#/pattern/shared)
* [Contribution Requests for Patterns: /ldsv2/design.php#/pattern/contributed](/ldsv2/design.php#/pattern/contributed)
* [New Pattern: /ldsv2/design.php#/pattern/create](/ldsv2/design.php#/pattern/create)
* [Edit a Pattern: /ldsv2/design.php#/pattern/edit/{id}](/ldsv2/design.php#/pattern/edit/{id})
* [Preview a Pattern: /ldsv2/design.php#/pattern/preview/{id}](/ldsv2/design.php#/pattern/preview/{id})
* [My Groups: /ldsv2/design.php#/group](/ldsv2/design.php#/group)
* [Group Member view: /ldsv2/design.php#/group/preview/{id}](/ldsv2/design.php#/group/preview/{id})
* [Group Owner view: /ldsv2/design.php#/group/edit/{id}](/ldsv2/design.php#/group/edit/{id})
* [Member management view: /ldsv2/design.php#/group/edit/{id}/member](/ldsv2/design.php#/group/edit/{id}/member)
