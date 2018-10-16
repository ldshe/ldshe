<?php

namespace App\Models;

class PatternTag extends BaseModel {

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
    protected $table = 'pattern_tags';

    protected $primaryKey = ['id', 'item_no'];

    public $incrementing = false;

}
