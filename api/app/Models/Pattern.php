<?php

namespace App\Models;

use Kalnoy\Nestedset\NodeTrait;

class Pattern extends BaseModel {

    use NodeTrait;

    protected $guarded = [];

    protected $hidden = [
        'collection_id',
        'course_id',
        'unit_id',
        'root_id',
        'parent_id',
        '_lft',
        '_rgt',
        'created_at',
        'updated_at',
    ];

    public $incrementing = false;

    private function getDependenciesById($id) {
        return PatternDependency::where('parent_id', $id)->get();
    }

    private function getTagsById($id, $modelClass) {
        switch($modelClass) {
            case PatternTag::class:
            return PatternTag::where('id', $id)->orderBy('item_no')->get()
                ->map(function($f) {
                    return $f->type;
                });

            case Feedback::class:
            return Feedback::where('id', $id)->orderBy('item_no')->get()
                ->map(function($f) {
                    return $f->type;
                });

            case Motivator::class:
            return Motivator::where('id', $id)->orderBy('item_no')->get()
                ->map(function($m) {
                    return $m->type;
                });

            case Resource::class:
            return Resource::where('id', $id)->orderBy('item_no')->get()
                ->map(function($r) {
                    return $r->type;
                });

            case Tool::class:
            return Tool::where('id', $id)->orderBy('item_no')->get()
                ->map(function($t) {
                    return $t->type;
                });
        }
    }

    private function getAdditionalsById($id, $modelClass) {
        $urlQuery = null;
        $attachQuery = null;
        switch($modelClass) {
            case Feedback::class:
                $urlQuery = AdditionalUrl::where('feedback_id', $id);
                $attachQuery = AdditionalAttachment::where('feedback_id', $id);
            break;

            case Motivator::class:
                $urlQuery = AdditionalUrl::where('motivator_id', $id);
                $attachQuery = AdditionalAttachment::where('motivator_id', $id);
            break;

            case Resource::class:
                $urlQuery = AdditionalUrl::where('resource_id', $id);
                $attachQuery = AdditionalAttachment::where('resource_id', $id);
            break;

            case Tool::class:
                $urlQuery = AdditionalUrl::where('tool_id', $id);
                $attachQuery = AdditionalAttachment::where('tool_id', $id);
            break;
        }

        $urls = $urlQuery->get()
            ->makeVisible(['key', 'pos'])
            ->map(function($u) {
                return $u->toCamelArray();
            });

        $attachs = $attachQuery
            ->with('file')
            ->get()
            ->makeVisible(['key', 'pos'])
            ->map(function($a) {
                return $a->toCamelArray();
            });

        $merged = collect([]);
        $merged = $merged->merge($urls);
        $merged = $merged->merge($attachs);
        $grouped = $merged->sortBy('pos')
            ->groupBy('key')
            ->map(function($items) {
                $items = collect($items)
                    ->map(function($i) {
                        unset($i['key']);
                        unset($i['pos']);
                        return $i;
                    });
                return ['data' => $items];
            });
        $results = $grouped->toArray();
        return empty($results) ? new \stdClass : $results;
    }

    public function toCamelArray() {
        $toCamelArray = function($model) {
            $array = $model->toArray();
            foreach($array as $key => $value) {
                $return[camel_case($key)] = $value;
            }
            return $return;
        };

        $traverse = function(&$array, &$newArray) use (&$traverse, &$toCamelArray) {
            foreach ($array as $key => $value) {
                if($key == 'children') {
                    if(count($value) > 0) {
                        $newArray['children'] = [];
                        foreach ($value as $child) {
                            $newSubArray = [];
                            $traverse($child, $newSubArray);
                            $newArray['children'][] = $newSubArray;
                        }
                    }
                } else {
                    $newArray[camel_case($key)] = $value;
                }
            }

            $dependencies = $this->getDependenciesById($array['id']);
            if(count($dependencies) > 0) {
                $newArray['dependencies'] = [];
                foreach($dependencies as $d) {
                    $newArray['dependencies'][] = $toCamelArray($d);
                }
            }

            $newArray['tags'] = $this->getTagsById($array['id'], PatternTag::class);
            $newArray['feedbacks'] = $this->getTagsById($array['id'], Feedback::class);
            $newArray['motivators'] = $this->getTagsById($array['id'], Motivator::class);
            $newArray['resources'] = $this->getTagsById($array['id'], Resource::class);
            $newArray['tools'] = $this->getTagsById($array['id'], Tool::class);
            $newArray['additionalFeedbacks'] = $this->getAdditionalsById($array['id'], Feedback::class);;
            $newArray['additionalMotivators'] = $this->getAdditionalsById($array['id'], Motivator::class);
            $newArray['additionalResources'] = $this->getAdditionalsById($array['id'], Resource::class);
            $newArray['additionalTools'] = $this->getAdditionalsById($array['id'], Tool::class);
        };
        $array = Pattern::scoped(['root_id' => $this->root_id])
          ->get()
          ->toTree()
          ->toArray();
        $newArray = [];
        $traverse($array[0], $newArray);
        return $newArray;
    }

    public function getParentIdName() {
        return 'parent_id';
    }

    // Specify parent id attribute mutator
    public function setParentAttribute($value) {
        $this->setParentIdAttribute($value);
    }

    protected function getScopeAttributes() {
        return ['root_id'];
    }

    public function dependencies() {
        return $this->hasMany('App\Models\PatternDependency', 'parent_id');
    }

    public function tags() {
        return $this->hasMany('App\Models\PatternTag', 'id');
    }

    public function feedbacks() {
        return $this->hasMany('App\Models\Feedback', 'id');
    }

    public function motivators() {
        return $this->hasMany('App\Models\Motivator', 'id');
    }

    public function resources() {
        return $this->hasMany('App\Models\Resource', 'id');
    }

    public function tools() {
        return $this->hasMany('App\Models\Tool', 'id');
    }

}
