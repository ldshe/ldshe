<?php
return [
    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the database connections below you wish
    | to use as your default connection for all database work. Of course
    | you may use many connections at once using the Database library.
    |
    */
    'default' => env('DB_CONNECTION', 'ldshev2'),
    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | Here are each of the database connections setup for your application.
    | Of course, examples of configuring each database platform that is
    | supported by Laravel is shown below to make development simple.
    |
    |
    | All database work in Laravel is done through the PHP PDO facilities
    | so make sure you have the driver for your particular database of
    | choice installed on your machine before you begin development.
    |
    */
    'connections' => [
        'ldshev2' => [
            'driver' => 'mysql',
            'host' => env('LDSHE_DB_HOST', 'localhost'),
            'port' => env('LDSHE_DB_PORT', '3306'),
            'database' => env('LDSHE_DB_DATABASE', 'ldshe'),
            'username' => env('LDSHE_DB_USERNAME', 'ldshedbo'),
            'password' => env('LDSHE_DB_PASSWORD', 'ldshedbo'),
            'unix_socket' => env('LDSHE_DB_SOCKET', ''),
            'charset' => 'utf8',
            'collation' => 'utf8_unicode_ci',
            'prefix' => 'ldshe_',
            'strict' => true,
            'engine' => null,
        ],

        'userspice' => [
            'driver' => 'mysql',
            'host' => env('LDSHE_DB_HOST', 'localhost'),
            'port' => env('LDSHE_DB_PORT', '3306'),
            'database' => env('LDSHE_DB_DATABASE', 'ldshe'),
            'username' => env('LDSHE_DB_USERNAME', 'ldshedbo'),
            'password' => env('LDSHE_DB_PASSWORD', 'ldshedbo'),
            'unix_socket' => env('LDSHE_DB_SOCKET', ''),
            'charset' => 'utf8',
            'collation' => 'utf8_unicode_ci',
            'strict' => true,
            'engine' => null,
        ],
    ],
    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | This table keeps track of all the migrations that have already run for
    | your application. Using this information, we can determine which of
    | the migrations on disk haven't actually been run in the database.
    |
    */
    'migrations' => 'migrations',

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | Redis is an open source, fast, and advanced key-value store that also
    | provides a richer set of commands than a typical key-value systems
    | such as APC or Memcached. Laravel makes it easy to dig right in.
    |
    */
    'redis' => [
        'client' => 'predis',
        'default' => [
            'host' => env('LDSHE_REDIS_HOST', 'localhost'),
            'port' => env('LDSHE_REDIS_PORT', 6379),
            'password' => env('LDSHE_REDIS_PASSWORD', 'ldshedbo'),
            'database' => 0,
        ],
    ],
];
