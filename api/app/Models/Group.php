<?php

namespace App\Models;

class Group extends BaseModel {

    protected $connection = 'ldshev2';

    protected $guarded = [];

    protected $hidden = [
        'id',
        'owner_id',
        'created_at',
        'updated_at',
    ];

    public function owner() {
        return $this->belongsTo('App\Models\User', 'owner_id');
    }

    public function members() {
        $db = $this->getConnection()->getDatabaseName();
        return $this->belongsToMany('App\Models\User', $db.'.ldshe_group_user')
            ->withPivot(['status', 'joined_at']);
    }
}
