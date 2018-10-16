<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository {

    public static function escapeLike($str) {
        return str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $str);
    }

    public function search($w) {
        if (empty($w)) {
            return [];
        }
        $isEmail = str_contains($w, '@');
        $w = self::escapeLike($w);
        $q = User::where('email', 'like', '%'.$w.'%');
        if(!$isEmail) {
            $q->orWhere('fname', 'like', '%'.$w.'%')
                ->orWhere('lname', 'like', '%'.$w.'%')
                ->orWhere('username', 'like', '%'.$w.'%');
        }
        return $q->orderBy('username')
            ->take(10)
            ->get()
            ->makeVisible('id')
            ->map(function($u) {
                return $u->toCamelArray();
            });
    }
}
