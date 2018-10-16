<?php

namespace App\Models;

class Course extends BaseModel {

    protected $guarded = [];

    protected $hidden = [
        'id',
        'role_id',
        'owner_id',
        'created_at',
        'updated_at',
        'refreshed_at',
    ];

    protected $dates = ['refreshed_at'];

    public function outcomes() {
        return $this->hasMany('App\Models\Outcome');
    }

    public function units() {
        return $this->hasMany('App\Models\Unit');
    }

    public function patterns() {
        return $this->hasMany('App\Models\Pattern');
    }

    public function sessions() {
        return $this->hasMany('App\Models\Session');
    }

    public function permissions() {
        return $this->hasMany('App\Models\CoursePermission');
    }

    public function groupedPermission($customQ=null) {
        $q = $this->hasOne('App\Models\CoursePermission')
            ->selectRaw('BIT_OR(`read`) as `read`, BIT_OR(`import`) as `import`, BIT_OR(`edit`) as `edit`')
            ->groupBy('course_id');
        if(!empty($customQ)) {
            $customQ($q);
        }
        return $q;
    }

    public function importHistories() {
        return $this->hasMany('App\Models\DesignImportHistory', 'from_id');
    }

    public function contribution() {
        return $this->hasOne('App\Models\ContributionRequest');
    }
}
