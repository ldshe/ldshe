<?php

namespace App\Models;

class AdditionalUrl extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'key',
        'pos',
        'feedback_id',
        'motivator_id',
        'resource_id',
        'tool_id',
        'created_at',
        'updated_at',
    ];

    public $incrementing = false;

}
