<?php

namespace App\Models;

use Carbon\Carbon;

class Session extends BaseModel {

    const PRE_STAGE = 'pre';
    const IN_STAGE = 'in';
    const POST_STAGE = 'post';

    protected $guarded = [];

    protected $hidden = [
        'course_id',
        'pos',
        'created_at',
        'updated_at',
    ];

    protected $dates = ['date'];

    public $incrementing = false;

    public function scopeIn($query) {
        return $query->where('stage', Session::IN_STAGE);
    }

    public function allocatedPatterns() {
        return $this->belongsToMany('App\Models\Pattern');
    }

    public function toCamelArray() {
        $array = $this->toArray();
        foreach($array as $key => $value) {
            if($key == 'utc_date') {
                $return[camel_case($key)] = empty($value) ? null : Carbon::createFromFormat('Y-m-d H:i:s', $value)->toIso8601String();
            } else {
                $return[camel_case($key)] = $value;
            }
        }
        return $return;
    }
}
