<?php

namespace App\Models;

class CollectionPermission extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'id',
        'collection_id',
        'user_id',
        'group_id',
        'created_at',
        'updated_at',
    ];

    public $incrementing = false;

}
