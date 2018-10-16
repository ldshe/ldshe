<?php

namespace App\Providers;

use Carbon\Carbon;
use Config;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

use App\Models\Collection;
use App\Models\Course;
use App\Models\Pattern;
use App\Models\Group;
use App\UserSpice\User;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Boot the authentication services for the application.
     *
     * @return void
     */
    public function boot()
    {
        // Here you may define how you wish users to be authenticated for your Lumen
        // application. The callback which receives the incoming request instance
        // should return either a User instance or null. You're free to obtain
        // the User instance via an API token or any other method necessary.

        // $this->app['auth']->viaRequest('api', function ($request) {
        //     if ($request->input('api_token')) {
        //         return User::where('api_token', $request->input('api_token'))->first();
        //     }
        // });

        $courseRepo = $this->app->make('\App\Repositories\CourseRepository');
        $pattRepo = $this->app->make('\App\Repositories\PatternRepository');
        $groupRepo = $this->app->make('\App\Repositories\GroupRepository');

        Gate::define('owner-can-curd-design', function (User $user, Course $course) {
            return $user->data()->id == $course->owner_id || collect($user->data()->permissions)->contains('id', $course->role_id);
        });

        Gate::define('owner-granted-access-design', function (User $user, Course $course, array $privileges) use ($courseRepo) {
            return $courseRepo->hasPermissions($course, $user, $privileges);
        });

        Gate::define('ensure-latest-content', function (User $user, Course $course, $timestamp=null) {
            if(empty($timestamp)) {
                return false;
            }
            $recorded = $course->refreshed_at;
            $given = Carbon::createFromTimestamp($timestamp)->timezone(env('APP_TIMEZONE'));
            if(empty($recorded)) {
                return false;
            }
            return $given->gte($recorded);
        });

        Gate::define('owner-can-curd-collection', function  (User $user, Collection $collect) {
            return $user->data()->id == $collect->owner_id || collect($user->data()->permissions)->contains('id', $collect->role_id);
        });

        Gate::define('owner-granted-access-collection', function (User $user, Collection $collect, array $privileges) use ($pattRepo) {
            return $pattRepo->hasCollectionPermissions($collect, $user, $privileges);
        });

        Gate::define('ensure-latest-collection', function (User $user, Collection $collect, $timestamp=null) {
            if(empty($timestamp)) {
                return false;
            }
            $recorded = $collect->refreshed_at;
            $given = Carbon::createFromTimestamp($timestamp)->timezone(env('APP_TIMEZONE'));
            if(empty($recorded)) {
                return false;
            }
            return $given->gte($recorded);
        });

        Gate::define('owner-can-curd-group', function (User $user, Group $group) {
            return $user->data()->id == $group->owner_id;
        });

        Gate::define('invitee-can-join-group', function (User $user, Group $group) use ($groupRepo) {
            return $groupRepo->isMember($group, $user->data()->id);
        });

        Gate::define('member-can-preview-group', function (User $user, Group $group) use ($groupRepo) {
            return $groupRepo->isActiveMember($group, $user->data()->id);
        });

        Gate::define('curator-can-list-curated-design', function (User $user) {
            $role = Config::get('userspice.curator.role');
            return $user->hasPermission($role);
        });

        Gate::define('curator-can-review-design', function (User $user) {
            $role = Config::get('userspice.curator.role');
            return $user->hasPermission($role);
        });

        Gate::define('curator-can-preview-design', function (User $user, Course $course) {
            $role = Config::get('userspice.curator.role');
            return $user->hasPermission($role) && $course->contribution()->count() > 0;
        });

        Gate::define('curator-can-list-curated-collection', function (User $user) {
            $role = Config::get('userspice.curator.role');
            return $user->hasPermission($role);
        });

        Gate::define('curator-can-review-collection', function (User $user) {
            $role = Config::get('userspice.curator.role');
            return $user->hasPermission($role);
        });

        Gate::define('curator-can-preview-collection', function (User $user, Collection $collect) {
            $role = Config::get('userspice.curator.role');
            return $user->hasPermission($role) && $collect->contribution()->count() > 0;
        });

        Gate::define('owner-can-curd-notification', function (User $user, DatabaseNotification $note) {
            return $user->data()->id == $note->notifiable_id;
        });
    }
}
