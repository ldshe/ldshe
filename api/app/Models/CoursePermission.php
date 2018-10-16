<?php

namespace App\Models;

class CoursePermission extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'id',
        'course_id',
        'user_id',
        'group_id',
        'created_at',
        'updated_at',
    ];

    public $incrementing = false;

}
