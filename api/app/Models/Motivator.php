<?php

namespace App\Models;

class Motivator extends BaseModel {

    use CompositePrimaryKey;

    protected $guarded = [];

    protected $hidden = [
        'id',
        'item_no',
        'created_at',
        'updated_at',
    ];

    //The default table name of Kalnoy\Nestedset is in singular form
    //Override to follow Laravel naming conventions
    protected $table = 'motivators';

    protected $primaryKey = ['id', 'item_no'];

    public $incrementing = false;

}
