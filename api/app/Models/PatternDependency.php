<?php

namespace App\Models;

class PatternDependency extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'parent_id',
        'created_at',
        'updated_at',
    ];

}
