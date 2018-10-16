<?php
return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application. Just store away!
    |
    */

    'default' => env('FILESYSTEM_DRIVER', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Default Cloud Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Many applications store files both locally and in the cloud. For this
    | reason, you may specify a default "cloud" driver here. This driver
    | will be bound as the Cloud disk implementation in the container.
    |
    */

    'cloud' => env('FILESYSTEM_CLOUD', 'google'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Here you may configure as many filesystem "disks" as you wish, and you
    | may even configure multiple disks of the same driver. Defaults have
    | been setup for each driver as an example of the required options.
    |
    | Supported Drivers: "local", "ftp", "sftp", "s3", "rackspace"
    |
    */

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app'),
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL').'/storage',
            'visibility' => 'public',
        ],

        'google' => [
            'driver' => 'google',
            'client_id' => env('GOOGLE_DRIVE_CLIENT_ID', 'your_client_id'),
            'client_secret' => env('GOOGLE_DRIVE_CLIENT_SECRET', 'your_client_secret'),
            'refresh_token' => env('GOOGLE_DRIVE_REFRESH_TOKEN', 'your_refresh_token'),
            'folder_id' => env('GOOGLE_DRIVE_FOLDER_ID', null),
            'team_drive_id' => env('GOOGLE_DRIVE_TEAM_DRIVE_ID', null),
            'publish_permission' => [
                'type' => 'anyone',
                'role' => 'reader',
                'withLink' => true
            ],
        ],
    ],

    'orphan_file_last_in' => env('LDSHE_ORPHAN_FILE_LAST_IN', 7),
];
