<?php

namespace App\UserSpice\Auth;

use Exception;

trait Authenticatable
{
    public function getAuthIdentifierName()
    {
        return $this->data()->username;
    }

    public function getAuthIdentifier()
    {
        return $this->data()->id;
    }

    public function getAuthPassword()
    {
        return $this->data()->password;
    }

    public function getRememberToken()
    {
        throw new Exception('Not implemented!');
    }

    public function setRememberToken($value)
    {
        throw new Exception('Not implemented!');
    }

    public function getRememberTokenName()
    {
        throw new Exception('Not implemented!');
    }
}
