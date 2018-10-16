<?php

namespace App\Models;

class Outcome extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'course_id',
        'pos',
        'created_at',
        'updated_at',
    ];

    public $incrementing = false;

}
