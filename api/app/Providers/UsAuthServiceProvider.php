<?php

namespace App\Providers;

use App\UserSpice\Cookie;
use App\UserSpice\DB;
use App\UserSpice\Session;
use App\UserSpice\User;
use Config;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class UsAuthServiceProvider extends ServiceProvider
{

    public function register()
    {
        //
    }

    public function boot()
    {
        session_start();
        $this->app['auth']->viaRequest('api', function ($request) {
            $this->checkRemeberMe();
            return $this->authenticate();
        });
    }

    private function checkRemeberMe()
    {
        if(Cookie::exists(Config::get('userspice.remember.cookie_name')) && !Session::exists(Config::get('userspice.session.session_name'))){
        	$hash = Cookie::get(Config::get('userspice.remember.cookie_name'));
        	$hashCheck = DB::getInstance()->query("SELECT * FROM users_session WHERE hash = ? AND uagent = ?",array($hash, Session::uagent_no_version()));
        	if ($hashCheck->count()) {
        		$user = new User($hashCheck->first()->user_id);
        		$user->login();
        	}
        }
    }

    private function authenticate()
    {
        $user = new User;
        if( $user->data() != null &&
            $user->data()->permissions !== 0 &&
            $user->data()->email_verified !== 0 &&
            $user->isLoggedIn()){
            return $user;
        }
    }
}
