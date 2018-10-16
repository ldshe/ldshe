<?php

namespace App\Models;

class AdditionalAttachment extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'key',
        'pos',
        'file_id',
        'feedback_id',
        'motivator_id',
        'resource_id',
        'tool_id',
        'created_at',
        'updated_at',
    ];

    public $incrementing = false;

    public function file() {
        return $this->belongsTo('App\Models\File');
    }

}
