<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Request;

use App\Models\NotifiableUser;

trait Helpers {

    protected function getAuthUser() {
        return Auth::guard(Request::get('guard'))->user();
    }

    protected function getNotifiableUser($id) {
        $u = new NotifiableUser;
        $u->id = $id;
        return $u;
    }

    protected function allows($policy, ...$args) {
        $user = $this->getAuthUser();
        return Gate::forUser($user)->allows($policy, ...$args);
    }

    protected function denies($policy, ...$args) {
        $user = $this->getAuthUser();
        return Gate::forUser($user)->denies($policy, ...$args);
    }
}
