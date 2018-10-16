<?php

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

$app->group(['prefix' => 'lds', 'middleware' => 'auth'], function() use ($app) {

    $app->group(['prefix' => 'designs'], function() use ($app) {

        $app->get('/', ['uses' => 'DesignController@getAllByOwner']);

        $app->get('/recently', ['uses' => 'DesignController@getRecentlyByOwner']);

        $app->get('{courseId:\d+}', ['uses' => 'DesignController@getReadable']);

        $app->get('curated', ['uses' => 'DesignController@getAllByCurator']);

        $app->get('contributed', ['uses' => 'DesignController@getAllByContributed']);

        $app->get('shared', ['uses' => 'DesignController@getAllByShared']);

        $app->get('shared/recently', ['uses' => 'DesignController@getRecentlyByShared']);

        $app->get('shared/groups/{groupId:\d+}', ['uses' => 'DesignController@getAllBySharedGroup']);

        $app->put('{courseId:\d+}/copy', ['uses' => 'DesignController@copy']);

        $app->get('{courseId:\d+}/import', ['uses' => 'DesignController@getImportable']);

        $app->put('{courseId:\d+}/import', ['uses' => 'DesignController@import']);
    });

    $app->group(['prefix' => 'courses'], function() use ($app) {

        $app->post('/', ['uses' => 'CourseController@create']);

        $app->post('curated', ['uses' => 'CourseController@createCurated']);

        $app->delete('{courseId:\d+}', ['uses' => 'CourseController@delete']);

        $app->group(['middleware' => 'mutex'], function() use ($app) {

            $app->put('{courseId:\d+}', ['uses' => 'CourseController@update']);

            $app->put('{courseId:\d+}/outcomes', ['uses' => 'OutcomeController@update']);

            $app->put('{courseId:\d+}/units', ['uses' => 'UnitController@update']);

            $app->patch('{courseId:\d+}/patterns', ['uses' => 'PatternController@updatePatterns']);

            $app->delete('{courseId:\d+}/patterns', ['uses' => 'PatternController@deletePatterns']);

            $app->patch('{courseId:\d+}/instances', ['uses' => 'PatternController@updateInstances']);

            $app->patch('{courseId:\d+}/instances/settings', ['uses' => 'PatternController@updateInstanceSettings']);

            $app->patch('{courseId:\d+}/sessions', ['uses' => 'SessionController@update']);

            $app->delete('{courseId:\d+}/sessions', ['uses' => 'SessionController@delete']);
        });

        $app->get('{courseId:\d+}/settings', ['uses' => 'CourseController@getConfig']);

        $app->patch('{courseId:\d+}/settings', ['uses' => 'CourseController@configure']);

        $app->put('{courseId:\d+}/contributions/request', ['uses' => 'CourseController@makeContribution']);

        $app->put('{courseId:\d+}/contributions/respond', ['uses' => 'CourseController@reviewContribution']);
    });

    $app->group(['prefix' => 'collections'], function() use ($app) {

        $app->get('patterns', ['uses' => 'CollectionController@getAllByOwner']);

        $app->get('patterns/recently', ['uses' => 'CollectionController@getRecentlyByOwner']);

        $app->get('patterns/curated', ['uses' => 'CollectionController@getAllByCurator']);

        $app->get('patterns/contributed', ['uses' => 'CollectionController@getAllByContributed']);

        $app->get('patterns/shared', ['uses' => 'CollectionController@getAllByShared']);

        $app->get('patterns/shared/recently', ['uses' => 'CollectionController@getRecentlyByShared']);

        $app->get('patterns/shared/groups/{groupId:\d+}', ['uses' => 'CollectionController@getAllBySharedGroup']);

        $app->get('patterns/{collectId:\d+}', ['uses' => 'CollectionController@getReadable']);

        $app->post('patterns', ['uses' => 'CollectionController@create']);

        $app->post('patterns/curated', ['uses' => 'CollectionController@createCurated']);

        $app->group(['middleware' => 'mutex'], function() use ($app) {

            $app->put('patterns/{collectId:\d+}', ['uses' => 'CollectionController@update']);

            $app->put('patterns/{collectId:\d+}/settings', ['uses' => 'CollectionController@updateSettings']);
        });

        $app->delete('patterns/{collectId:\d+}', ['uses' => 'CollectionController@delete']);

        $app->get('patterns/{collectId:\d+}/settings', ['uses' => 'CollectionController@getConfig']);

        $app->patch('patterns/{collectId:\d+}/settings', ['uses' => 'CollectionController@configure']);

        $app->put('patterns/{collectId:\d+}/contributions/request', ['uses' => 'CollectionController@makeContribution']);

        $app->put('patterns/{collectId:\d+}/contributions/respond', ['uses' => 'CollectionController@reviewContribution']);

        $app->put('patterns/{collectId:\d+}/copy', ['uses' => 'CollectionController@copy']);

        $app->get('patterns/{collectId:\d+}/import', ['uses' => 'CollectionController@getImportable']);

        $app->put('patterns/{collectId:\d+}/import', ['uses' => 'CollectionController@import']);
    });

    $app->group(['prefix' => 'mutex'], function() use ($app) {

        $app->put('courses/{courseId:\d+}', ['uses' => 'MutexController@createCourseLock']);

        $app->put('collections/{collectId:\d+}', ['uses' => 'MutexController@createCollectionLock']);

        $app->put('courses/{courseId:\d+}/takeover', ['uses' => 'MutexController@takeoverCourseLock']);

        $app->put('collections/{collectId:\d+}/takeover', ['uses' => 'MutexController@takeoverCollectionLock']);

        $app->put('keepalive/{id:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}', ['uses' => 'MutexController@keepAlive']);
    });

    $app->group(['prefix' => 'files'], function() use ($app) {
        $app->post('/', ['uses' => 'FileController@create']);

        $app->get('{id:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}', ['uses' => 'FileController@get']);
    });

    $app->group(['prefix' => 'groups'], function() use ($app) {
        $app->post('/', ['uses' => 'GroupController@create']);

        $app->get('/', ['uses' => 'GroupController@getAllByMember']);

        $app->get('/recently', ['uses' => 'GroupController@getRecentlyByMember']);

        $app->get('{groupId:\d+}', ['uses' => 'GroupController@get']);

        $app->put('{groupId:\d+}', ['uses' => 'GroupController@update']);

        $app->delete('{groupId:\d+}', ['uses' => 'GroupController@delete']);

        $app->get('{groupId:\d+}/members', ['uses' => 'GroupController@getAllMembersByMember']);

        $app->get('{groupId:\d+}/members/manageable', ['uses' => 'GroupController@getAllMembersByOwner']);

        $app->post('{groupId:\d+}/members', ['uses' => 'GroupController@addMember']);

        $app->delete('{groupId:\d+}/members/{userId:\d+}', ['uses' => 'GroupController@deleteMember']);

        $app->put('{groupId:\d+}/members/{userId:\d+}/join', ['uses' => 'GroupController@joinGroup']);

        $app->put('{groupId:\d+}/members/{userId:\d+}/leave', ['uses' => 'GroupController@leaveGroup']);
    });

    $app->group(['prefix' => 'notifications'], function() use ($app) {
        $app->get('/', ['uses' => 'NotificationController@getAllByOwner']);

        $app->delete('{noteId:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}', ['uses' => 'NotificationController@delete']);
    });

    $app->group(['prefix' => 'users'], function() use ($app) {
        $app->get('/', ['uses' => 'UserController@getAllByQuery']);
    });
});
