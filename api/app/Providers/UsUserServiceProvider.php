<?php

namespace App\Providers;

use App\UserSpice\User;

use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Auth\Authenticatable;

class UsUserServiceProvider implements UserProvider
{
    public function retrieveByCredentials(array $credentials)
    {
        if (empty($credentials)) {
            return;
        }

        $user = new User;
        return $user->find($credentials['username']) ? $user : null;
    }

    public function validateCredentials(Authenticatable $user, Array $credentials)
    {
        if (empty($credentials)) {
            return;
        }

        $user = new User;
        return $user->login($credentials['username'], $credentials['password']);
    }

    public function retrieveById($identifier)
    {
        if (empty($identifier)) {
            return;
        }

        $user = new User;
        return $user->find($identifier) ? $user : null;
    }

    public function retrieveByToken($identifier, $token)
    {
        //
    }

    public function updateRememberToken(Authenticatable $user, $token)
    {
        //
    }
}
