<?php

namespace App\Models;

class Unit extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'course_id',
        'pos',
        'created_at',
        'updated_at',
    ];

    public $incrementing = false;

    public function outcomes() {
        return $this->belongsToMany('App\Models\Outcome');
    }

    public function instance() {
        return $this->hasOne('App\Models\Pattern');
    }

}
