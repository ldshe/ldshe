<?php

namespace App\Models;

class ResourceMutex extends BaseModel {

    protected $dates = ['keep_alive', 'last_active'];

    public $incrementing = false;

    public function course() {
        return $this->belongsTo('App\Models\Course');
    }

    public function collection() {
        return $this->belongsTo('App\Models\Collection');
    }
}
