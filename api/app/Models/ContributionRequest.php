<?php

namespace App\Models;

class ContributionRequest extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'id',
        'course_id',
        'collection_id',
        'created_at',
        'updated_at',
    ];

    public function scopeDesignType($q) {
        return $q->whereNotNull('course_id');
    }

    public function scopeCollectionType($q) {
        return $q->whereNotNull('collection_id');
    }

    public function scopePending($q) {
        return $q->where('status', 'pending');
    }

    public function course() {
        return $this->belongsTo('App\Models\Course');
    }

    public function collection() {
        return $this->belongsTo('App\Models\Collection');
    }
}
