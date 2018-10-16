<?php

namespace App\Models;

class File extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'owner_id',
        'delete_at',
        'created_at',
        'updated_at',
    ];

    protected $dates = ['delete_at'];

    protected $primaryKey = 'id';

    public $incrementing = false;

}
