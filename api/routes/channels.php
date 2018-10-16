<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Gate;

use App\Models\Course;
use App\Models\Collection;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

$app->group(['middleware' => 'auth'], function () use ($app) {

    $app->post('broadcasting/auth', ['uses' => 'BroadcastController@authenticate']);
});

Broadcast::channel('notify.user.{userId}', function ($user, $userId) {
    return $userId == $user->data()->id;
});

Broadcast::channel('preview.design.{courseId}', function ($user, $courseId) {
    $course = Course::findOrFail($courseId);
    return (
        Gate::allows('owner-can-curd-design', $course) ||
        Gate::allows('owner-granted-access-design', [$course, ['read']])
    );
});

Broadcast::channel('edit.design.{courseId}', function ($user, $courseId) {
    $course = Course::findOrFail($courseId);
    $isAllowed = (
        Gate::allows('owner-can-curd-design', $course) ||
        Gate::allows('owner-granted-access-design', [$course, ['edit']])
    );

    if($isAllowed) {
        $u = User::findOrFail($user->data()->id);
        return [
            'id' => $u->id,
            'name' => $u->fname.' '.$u->lname,
        ];
    } else {
        return false;
    }
});

Broadcast::channel('preview.collection.{collectId}', function ($user, $collectId) {
    $collect = Collection::findOrFail($collectId);
    return (
        Gate::allows('owner-can-curd-collection', $collect) ||
        Gate::allows('owner-granted-access-collection', [$collect, ['read']])
    );
});

Broadcast::channel('edit.collection.{collectId}', function ($user, $collectId) {
    $collect = Collection::findOrFail($collectId);
    $isAllowed = (
        Gate::allows('owner-can-curd-collection', $collect) ||
        Gate::allows('owner-granted-access-collection', [$collect, ['edit']])
    );

    if($isAllowed) {
        $u = User::findOrFail($user->data()->id);
        return [
            'id' => $u->id,
            'name' => $u->fname.' '.$u->lname,
        ];
    } else {
        return false;
    }
});
