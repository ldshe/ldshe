<?php

namespace App\Models;

use DB;

class User extends BaseModel {

    protected $connection = 'userspice';

    protected $guarded = [];

    protected $visible = [
        'email',
        'username',
        'fname',
        'lname',
    ];

    public function scopeActiveMembers($q) {
        $db = $this->getConnection()->getDatabaseName();
        $q->whereRaw($db.".ldshe_group_user.status = 'active'")
            ->get();
    }

    public function groups() {
        return $this->belongsToMany('App\Models\Group')
            ->withPivot(['status', 'joined_at']);
    }
}
