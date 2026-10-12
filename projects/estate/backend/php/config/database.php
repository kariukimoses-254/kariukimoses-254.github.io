<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    */

    'default' => env('DB_CONNECTION', 'pgsql'),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    */

    'connections' => [

        'pgsql' => [
            'driver'   => 'pgsql',
            'host'     => env('PG_HOST', '127.0.0.1'),
            'port'     => env('PG_PORT', '5432'),
            'database' => env('PG_DATABASE', 'fullstack_estate'),
            'username' => env('PG_USERNAME', 'postgres'),
            'password' => env('PG_PASSWORD', 'postgres'),
            'charset'  => 'utf8',
            'prefix'   => '',
            'search_path' => 'public',
            'sslmode'  => 'prefer',
        ],

        'mysql' => [
            'driver'         => 'mysql',
            'host'           => env('MYSQL_HOST', '127.0.0.1'),
            'port'           => env('MYSQL_PORT', '3306'),
            'database'       => env('MYSQL_DATABASE', 'fullstack_estate_mysql'),
            'username'       => env('MYSQL_USERNAME', 'root'),
            'password'       => env('MYSQL_PASSWORD', 'root'),
            'unix_socket'    => env('DB_SOCKET', ''),
            'charset'        => 'utf8mb4',
            'collation'      => 'utf8mb4_unicode_ci',
            'prefix'         => '',
            'strict'         => true,
            'engine'         => null,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    */

    'migrations' => 'migrations',

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    */

    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'default' => [
            'host'     => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD', null),
            'port'     => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
    ],

];