<?php

return [
    'master_account' => [1],
    'curator' => [
        'role' => 'Curator',
    ],
    'mysql'  => [
        'host'       => env('LDSHE_DB_HOST', 'localhost'),
        'port'       => env('LDSHE_DB_PORT', '3306'),
        'db'         => env('LDSHE_DB_DATABASE', 'ldshe'),
        'username'   => env('LDSHE_DB_USERNAME', 'ldshedbo'),
        'password'   => env('LDSHE_DB_PASSWORD', 'ldshedbo'),
    ],
    'remember' => [
        'cookie_name'   => 'pmqesoxiw318374csb',
        'cookie_expiry' => 604800,  //One week, feel free to make it longer
    ],
    'session' => [
        'session_name' => 'user',
        'token_name'   => 'token',
    ],
];
