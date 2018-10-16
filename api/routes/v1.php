<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

//Public API service for affiliate applications e.g. Moodle plugin
$app->group(['prefix' => 'v1', 'middleware' => 'auth:v1'], function() use ($app) {

    $app->group(['prefix' => 'designs'], function() use ($app) {

        $app->get('/', ['uses' => 'DesignController@getAllByOwner']);

        $app->get('shared', ['uses' => 'DesignController@getAllByShared']);

        $app->get('{courseId:\d+}', ['uses' => 'DesignController@read']);
    });

    $app->group(['prefix' => 'files'], function() use ($app) {

        $app->get('{id:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}', ['uses' => 'FileController@get']);
    });

});
