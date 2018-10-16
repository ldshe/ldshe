<?php

namespace App\Providers;

use Storage;
use Google_Client;
use Google_Service_Drive;
use Illuminate\Support\ServiceProvider;
use App\Flysystem\Filesystem;
use Hypweb\Flysystem\GoogleDrive\GoogleDriveAdapter;

class GoogleDriveServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        Storage::extend('google', function($app, $config) {
            $client = new Google_Client;
            $client->setClientId($config['client_id']);
            $client->setClientSecret($config['client_secret']);
            $client->refreshToken($config['refresh_token']);
            $service = new Google_Service_Drive($client);
            $options = [];
            $teamDriveId = $config['team_drive_id'];
            if(isset($teamDriveId)) {
                $options['teamDriveId'] = $teamDriveId;
            }
            $publishPermission = $config['publish_permission'];
            if(isset($publishPermission)) {
                $options['publishPermission'] = $publishPermission;
            }
            $adapter = new GoogleDriveAdapter($service, $config['folder_id'], $options);
            return new Filesystem($adapter);
        });
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
