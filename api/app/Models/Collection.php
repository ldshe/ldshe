<?php

namespace App\Models;

class Collection extends BaseModel {

    protected $dates = ['refreshed_at'];

    public function pattern() {
        return $this->hasOne('App\Models\Pattern');
    }

    public function permissions() {
        return $this->hasMany('App\Models\CollectionPermission');
    }

    public function groupedPermission($customQ=null) {
        $q = $this->hasOne('App\Models\CollectionPermission')
            ->selectRaw('BIT_OR(`read`) as `read`, BIT_OR(`import`) as `import`, BIT_OR(`edit`) as `edit`')
            ->groupBy('collection_id');
        if(!empty($customQ)) {
            $customQ($q);
        }
        return $q;
    }

    public function importHistories() {
        return $this->hasMany('App\Models\CollectionImportHistory', 'from_id');
    }

    public function contribution() {
        return $this->hasOne('App\Models\ContributionRequest');
    }

}
