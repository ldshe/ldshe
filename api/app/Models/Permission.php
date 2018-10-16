<?php

namespace App\Models;

class Permission extends BaseModel {

    protected $connection = 'userspice';

    protected $guarded = [];

    protected $visible = [
        'name',
    ];
}
