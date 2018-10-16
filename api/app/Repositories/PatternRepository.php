<?php

namespace App\Repositories;

use Carbon\Carbon;
use Config;
use DB;
use Exception;
use App\Models\AdditionalAttachment;
use App\Models\AdditionalUrl;
use App\Models\Collection;
use App\Models\CollectionPermission;
use App\Models\ContributionRequest;
use App\Models\CollectionImportHistory;
use App\Models\Course;
use App\Models\Group;
use App\Models\Pattern;
use App\Models\PatternDependency;
use App\Models\PatternTag;
use App\Models\Feedback;
use App\Models\Motivator;
use App\Models\Permission;
use App\Models\Resource;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Ramsey\Uuid\Uuid;

class PatternRepository {

    private function createDependencies(&$dependencies) {
        foreach($dependencies as $d) {
            $tmp = [];
            collect($d)->keys()
                ->each(function($k) use ($d, &$tmp) {
                    $tmp[$k] = $d[$k];
                });
            PatternDependency::create($tmp);
        }
    }

    private function createTags($patt, $modelClass, &$value) {
        if(empty($value)) {
            return;
        }

        $models = collect($value)->map(function($v, $i) use ($patt, $modelClass) {
            $model = new $modelClass;
            $model->id = $patt->id;
            $model->item_no = $i;
            $model->type = $v;
            return $model;
        });

        switch($modelClass) {
            case PatternTag::class:
                $patt->tags()->saveMany($models);
            break;
            case Feedback::class:
                $patt->feedbacks()->saveMany($models);
            break;
            case Motivator::class:
                $patt->motivators()->saveMany($models);
            break;
            case Resource::class:
                $patt->resources()->saveMany($models);
            break;
            case Tool::class:
                $patt->tools()->saveMany($models);
            break;
        }
    }

    private function createAdditionalUrls($additionals) {
        $urls = $additionals->filter(function($c) {
            return $c['type'] == 'url';
        });
        if(!empty($urls)) {
            AdditionalUrl::insert($urls->toArray());
        }
    }

    private function createAdditionalAttachments($patt, $additionals) {
        $attachments = $additionals->filter(function($c) {
            return $c['type'] == 'file';
        });
        if(!empty($attachments)) {
            $attachments->each(function($a) {
                $f = $a['file'];
                unset($a['file']);
                if(!empty($f)) {
                    $a['file_id'] = $f['id'];
                }
                AdditionalAttachment::create($a);
            });
        }
    }

    private function createAdditionals($patt, $target, $value) {
        foreach($value as $key => $content) {
            $foreignKey = $target.'_id';
            $foreignId = $patt->id;
            $collects = collect($content['data'])->map(function($c) use ($key, $foreignKey, $foreignId) {
                $c['key'] = $key;
                $c[$foreignKey] = $foreignId;
                return $c;
            });
            $this->createAdditionalUrls($collects);
            $this->createAdditionalAttachments($patt, $collects);
        }
    }

    private function deleteTags($patt, $modelClass) {
        switch($modelClass) {
            case PatternTag::class:
                $patt->tags()->delete();
            break;
            case Feedback::class:
                $patt->feedbacks()->delete();
            break;
            case Motivator::class:
                $patt->motivators()->delete();
            break;
            case Resource::class:
                $patt->resources()->delete();
            break;
            case Tool::class:
                $patt->tools()->delete();
            break;
        }
    }

    private function updateFields(Pattern $patt, &$data, &$dependencies=[]) {
        foreach($data as $name => $value) {
            switch($name) {
                case 'tags':
                    $this->createTags($patt, PatternTag::class, $value);
                break;

                case 'feedbacks':
                    $this->createTags($patt, Feedback::class, $value);
                break;

                case 'motivators':
                    $this->createTags($patt, Motivator::class, $value);
                break;

                case 'resources':
                    $this->createTags($patt, Resource::class, $value);
                break;

                case 'tools':
                    $this->createTags($patt, Tool::class, $value);
                break;

                case 'additionalFeedbacks':
                    $this->createAdditionals($patt, 'feedback', $value);
                break;

                case 'additionalMotivators':
                    $this->createAdditionals($patt, 'motivator', $value);
                break;

                case 'additionalResources':
                    $this->createAdditionals($patt, 'resource', $value);
                break;

                case 'additionalTools':
                    $this->createAdditionals($patt, 'tool', $value);
                break;

                case 'dependencies':
                    $dependencies = array_merge($dependencies, $value);
                break;

                case 'id':
                case 'children':
                break;

                default:
                    $patt->$name = $value;
            }
        }
    }

    private function create($foreignKey, $foreignId, $rootId, &$data, &$dependencies) {
        $traverse = function(&$data, &$dependencies, $parent=null) use (&$traverse, $foreignKey, $foreignId, $rootId) {
            $node = new Pattern;
            $node->id = $data['id'];
            $node->rootId = $rootId;
            if($data['id'] == $rootId) {
                $node->$foreignKey = $foreignId;
            }

            if(isset($parent)) {
                $parent->appendNode($node);
            } else {
                $node->save();
            }

            $this->updateFields($node, $data, $dependencies);
            $node->save();

            if(!empty($data['children'])) {
                foreach($data['children'] as $child) {
                    $traverse($child, $dependencies, $node);
                }
            }
        };
        $traverse($data, $dependencies);
        Pattern::scoped(['root_id' => $rootId])->fixTree();
    }

    public function getPatterns($courseId) {
        $course = Course::findOrFail($courseId);
        $patterns = $course->patterns
            ->map(function($p) {
                return [$p->id => $p->toCamelArray()];
            });
        return $patterns;
    }

    public function updatePatterns($courseId, $data) {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($courseId);
            foreach($data as $rootId => $value) {
                $patt = $course->patterns()
                    ->find($rootId);
                if($patt) {
                    $patt->delete();
                }
                $dependencies = [];
                $this->create('course_id', $courseId, $rootId, $value, $dependencies);
                $this->createDependencies($dependencies);
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deletePatterns($courseId, $data) {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($courseId);
            $course->patterns()
                ->whereIn('id', $data)
                ->delete();
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getInstances($courseId) {
        $course = Course::findOrFail($courseId);
        $instances = [];
        $course->units->map(function($u) use (&$instances) {
            $inst = $u->instance;
            if($inst) {
                $instances[] = [$u->id => $inst->toCamelArray()];
            }
        });
        return $instances;
    }

    public function updateInstances($courseId, $data) {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($courseId);
            foreach($data as $unitId => $value) {
                $unit = $course->units()
                    ->findOrFail($unitId);
                $rootId = $value['id'];
                $inst = $unit->instance()
                    ->find($rootId);
                if($inst) {
                    $inst->delete();
                }
                $dependencies = [];
                $this->create('unit_id', $unitId, $rootId, $value, $dependencies);
                $this->createDependencies($dependencies);
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateInstanceSettings($data) {
        DB::beginTransaction();
        try {
            foreach($data as $id => $value) {
                $patt = Pattern::findOrFail($id);
                $this->deleteTags($patt, PatternTag::class);
                $this->deleteTags($patt, Feedback::class);
                $this->deleteTags($patt, Motivator::class);
                $this->deleteTags($patt, Resource::class);
                $this->deleteTags($patt, Tool::class);
                $this->updateFields($patt, $value);
                $patt->save();
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getCollectionsByOwner(\App\UserSpice\User $user, $filterQ=null) {
        $userId = $user->data()->id;
        $role = Permission::where('name', Config::get('userspice.curator.role'))->first();
        $roleId = $role->id;
        $q = Collection::where('owner_id', $userId)
            ->with('pattern');
        if(!empty($filterQ)) {
            $filterQ($q);
        }
        $collects = $q->get();
        return $collects->map(function($c) use ($roleId) {
            $shared = false;
            $shared = $c->permissions->count() > 0;
            if(!$shared) {
                $shared = $c->importHistories()
                    ->whereExists(function($q) use ($roleId) {
                        $q->select(DB::raw(1))
                            ->from('collections')
                            ->whereRaw('ldshe_collections.id = ldshe_collection_import_histories.to_id')
                            ->where('role_id', $roleId);
                    })
                    ->count() > 0;
            }
            $p = $c->pattern;
            return [
                'id' => $c->id,
                'fullname' => $p ? $p->fullname : '',
                'tags' => $p ? $p->tags->map(function($t) {
                    return $t->type;
                }) : [],
                'shared' => $shared,
            ];
        });
    }

    public function getRecentlyCollectionsByOwner(\App\UserSpice\User $user) {
        $filterQ = function($q) {
            $q->orderBy('updated_at', 'desc')
                ->take(5);
        };
        return $this->getCollectionsByOwner($user, $filterQ);
    }

    public function getCollectionsByCurator() {
        $role = Permission::where('name', Config::get('userspice.curator.role'))->first();
        $roleId = $role->id;
        $collects = Collection::where('role_id', $roleId)
            ->with('pattern')
            ->get();
        return $collects->map(function($c) {
            $shared = $c->permissions->count() > 0;
            $p = $c->pattern;
            $cArr = [
                'id' => $c->id,
                'fullname' => $p ? $p->fullname : '',
                'tags' => $p ? $p->tags->map(function($t) {
                    return $t->type;
                }) : [],
                'shared' => $shared,
            ];
            $cArr['owner'] = '';
            $src = CollectionImportHistory::where('to_id', $c->id)
                ->first();
            if($src) {
                if(!empty($src->from_user)) {
                    $owner = User::find($src->from_user);
                    $cArr['owner'] = $owner->fname.' '.$owner->lname;
                } else {
                    $role = Permission::find($src->from_role);
                    $cArr['owner'] = $role->name;
                }
            }
            if(empty($cArr['owner'])) {
                $cArr['owner'] = Config::get('userspice.curator.role');
            }
            return $cArr;
        });
    }

    private function getCollectionsBySharedHelper(\App\UserSpice\User $user, $mode='all', $showOwned=false, $filterQ=null, $permitQ=null) {
        $userId = $user->data()->id;
        $permitCondQ = function($q) use ($mode, $userId, $permitQ) {
            if($mode == 'all') {
                $q->where('mode', $mode);
            } else {
                if(is_array($mode)) {
                    $q->whereIn('mode', $mode);
                } else {
                    $q->where('mode', $mode);
                }
                $q->where(function($q) use ($userId) {
                    $q->where('user_id', $userId)
                    ->orWhereExists(function($q) use ($userId) {
                        $q->select(DB::raw(1))
                            ->from('group_user')
                            ->whereRaw('ldshe_group_user.group_id = ldshe_collection_permissions.group_id')
                            ->where('status', 'active')
                            ->where('user_id', $userId);
                    });
                });
            }
            if(!empty($permitQ)) {
                $permitQ($q);
            }
        };
        $q = Collection::whereHas('permissions', $permitCondQ);
        if(!$showOwned) {
            $q->where(function($q) use ($userId) {
                $q->orWhereNull('owner_id')
                    ->orWhere('owner_id', '<>', $userId);
            });
        }
        if(!empty($filterQ)) {
            $filterQ($q);
        }
        $collects = $q->get();
        return $collects->map(function($c) use ($mode, $permitCondQ) {
            $p = $c->pattern;
            $cArr = [
                'id' => $c->id,
                'fullname' => $p ? $p->fullname : '',
                'tags' => $p ? $p->tags->map(function($t) {
                    return $t->type;
                }) : [],
                'permission' => $c->groupedPermission($permitCondQ)->first(),
            ];
            $cArr['owner'] = '';
            if($mode == 'all') {
                $src = CollectionImportHistory::where('to_id', $c->id)
                    ->first();
                if($src) {
                    if(!empty($src->from_user)) {
                        $owner = User::find($src->from_user);
                        $cArr['owner'] = $owner->fname.' '.$owner->lname;
                    } else {
                        $role = Permission::find($src->from_role);
                        $cArr['owner'] = $role->name;
                    }
                }
            }
            if(empty($cArr['owner'])) {
                if(!empty($c->owner_id)) {
                    $owner = User::find($c->owner_id);
                    $cArr['owner'] = $owner->fname.' '.$owner->lname;
                } else {
                    $role = Permission::find($c->role_id);
                    $cArr['owner'] = $role->name;
                }
            }
            return $cArr;
        });
    }

    public function getCollectionsByShared(\App\UserSpice\User $user, $mode) {
        return $this->getCollectionsBySharedHelper($user, $mode);
    }

    public function getCollectionsBySharedGroup(\App\UserSpice\User $user, $groupId) {
        $permitQ = function($q) use ($groupId) {
            $q->where('group_id', $groupId);
        };
        return $this->getCollectionsBySharedHelper($user, 'group', true, null, $permitQ);
    }

    public function getRecentlyCollectionsByShared(\App\UserSpice\User $user) {
        $userId = $user->data()->id;
        $sql = 'SELECT c.id FROM ';
        $sql .= "    ldshe_collections as c, ldshe_collection_permissions as p ";
        $sql .= "WHERE c.id = p.collection_id ";
        $sql .= "AND ( ";
        $sql .= "  owner_id IS null ";
        $sql .= "  OR owner_id <> ? ";
        $sql .= ") ";
        $sql .= "AND p.id = ( ";
        $sql .= "    SELECT id FROM ldshe_collection_permissions pp ";
        $sql .= "    WHERE c.id = collection_id ";
        $sql .= "    AND mode IN ('user', 'group') ";
        $sql .= "    AND ( ";
        $sql .= "        user_id = ? ";
        $sql .= "        OR EXISTS ( ";
        $sql .= "            SELECT 1 FROM ldshe_group_user WHERE group_id = pp.group_id AND status = 'active' AND user_id = ? ";
        $sql .= "        ) ";
        $sql .= "    ) ";
        $sql .= "    ORDER BY updated_at DESC LIMIT 1 ";
        $sql .= ") ";
        $sql .= "ORDER BY p.updated_at DESC LIMIT 5 ";
        return collect(DB::select($sql, [$userId, $userId, $userId]))
            ->map(function ($r) {
                $c = Collection::find($r->id);
                $p = $c->pattern;
                $cArr = [
                    'id' => $c->id,
                    'fullname' => $p ? $p->fullname : '',
                    'tags' => $p ? $p->tags->map(function($t) {
                        return $t->type;
                    }) : [],
                ];
                $cArr['owner'] = '';
                if(empty($cArr['owner'])) {
                    if(!empty($c->owner_id)) {
                        $owner = User::find($c->owner_id);
                        $cArr['owner'] = $owner->fname.' '.$owner->lname;
                    } else {
                        $role = Permission::find($c->role_id);
                        $cArr['owner'] = $role->name;
                    }
                }
                return $cArr;
            });
    }

    public function getCollectionsByContributed($status='pending') {
        return ContributionRequest::collectionType()
            ->pending()
            ->get()
            ->map(function($r) {
                $c = $r->collection()
                    ->with('pattern')
                    ->first();
                $p = $c->pattern;
                $owner = User::find($c->owner_id);
                return [
                    'id' => $c->id,
                    'fullname' => $p ? $p->fullname : '',
                    'tags' => $p ? $p->tags->map(function($t) {
                        return $t->type;
                    }) : [],
                    'owner' => $owner->fname.' '.$owner->lname,
                ];
            });
    }

    public function findCollection($id) {
        return Collection::findOrFail($id);
    }

    public function getCollection($collect) {
        $pattern = $collect->pattern;
        return is_null($pattern) ? new \stdClass : $pattern->toCamelArray();
    }

    public function countDuplicatedCollectionNames(Collection $collect, $fullname) {
        if(!empty($collect->owner_id)) {
            $q = Collection::where('owner_id', $collect->owner_id);
        } else {
            $q = Collection::where('role_id', $collect->role_id);
        }
        $espFullname = preg_replace('/\\\\/', '\\\\\\\\', preg_quote($fullname));
        $espFullname = str_replace("'", "''", $espFullname);
        return $q->join('patterns', 'collections.id', '=', 'patterns.collection_id')
            ->whereRaw("ldshe_patterns.fullname REGEXP '^(".$espFullname.")( - Copy \\\\([[:digit:]]+\\\\))*'")
            ->count();
    }

    public function createCollection(\App\UserSpice\User $user, $data) {
        DB::beginTransaction();
        try {
            $userId = $user->data()->id;
            $collect = new Collection;
            $collect->owner_id = $userId;
            $collect->save();
            $collectId = $collect->id;
            if(!empty($data)) {
                foreach($data as $rootId => &$value) {
                    $name = $value['fullname'];
                    $nameCount = $this->countDuplicatedCollectionNames($collect, $name) + 1;
                    if($nameCount > 1) {
                        $value['fullname'] = substr($name, 0, 248).' - Copy ('.$nameCount.')';
                    }
                }
                $this->updateCollection($collect, $data);
            }
            DB::commit();
            return $collectId;
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function createCuratedCollection() {
        DB::beginTransaction();
        try {
            $collect = new Collection;
            $role = Permission::where('name', Config::get('userspice.curator.role'))->first();
            $collect->role_id = $role->id;
            $collect->save();

            $p = new CollectionPermission;
            $p->id = Uuid::uuid4();
            $p->mode = 'all';
            $p->read = true;
            $p->import = true;
            $collect->permissions()
                ->save($p);

            DB::commit();
            return $collect->id;
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function collectionRefreshAt($collectId, Carbon $at=null) {
        if(is_null($at)) {
            $at = Carbon::now(env('APP_TIMEZONE'))->timestamp;
        }
        DB::beginTransaction();
        try {
            $collect = Collection::find($collectId);
            $collect->refreshed_at = $at;
            $collect->save();
            DB::commit();
            return $at;
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateCollection(Collection $collect, $data) {
        DB::beginTransaction();
        try {
            foreach($data as $rootId => $value) {
                $patt = $collect->pattern();
                if($patt) {
                    $patt->delete();
                }
                $dependencies = [];
                $this->create('collection_id', $collect->id, $rootId, $value, $dependencies);
                $this->createDependencies($dependencies);
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteCollection(Collection $collect) {
        DB::beginTransaction();
        try {
            $collect->delete();
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getSharedCollection(Collection $collect) {
        return $collect->permissions()
            ->get()
            ->makeVisible('id')
            ->map(function($p) {
                if($p->mode == 'all') {
                    $pArr = $p->toCamelArray();
                }
                if($p->mode == 'user') {
                    $pArr = $p->toCamelArray();
                    $shareTo = User::find($p->user_id);
                    $pArr['username'] = $shareTo->username;
                    $pArr['email'] = $shareTo->email;
                    $pArr['fullname'] = $shareTo->fname.' '.$shareTo->lname;
                }
                if($p->mode == 'group') {
                    $p->makeVisible('group_id');
                    $pArr = $p->toCamelArray();
                    $shareTo = Group::find($p->group_id);
                    $pArr['name'] = $shareTo->name;
                    $p->makeVisible('group_id');
                }
                return $pArr;
            });
    }

    public function shareCollection(Collection $collect, $data) {
        DB::beginTransaction();
        try {
            $q = $collect->permissions()
                ->where('mode', $data['mode']);
            if($data['mode'] == 'user') {
                if(empty($data['email'])) {
                    $q->whereRaw('user_id in (select id from users where username = ?)', [$data['username']]);
                } else {
                    $q->whereRaw('user_id in (select id from users where email = ?)', [$data['email']]);
                }
            }
            if($data['mode'] == 'group') {
                $q->where('group_id', $data['groupId']);
            }
            $q->delete();

            if($data['enabled']) {
                $p = new CollectionPermission;
                $p->id = Uuid::uuid4();
                $p->mode = $data['mode'];
                $p->read = !empty($data['read']);
                $p->import = !empty($data['import']);
                $p->edit = !empty($data['edit']);
                if($data['mode'] == 'user') {
                    $shareTo = [];
                    if(empty($data['email'])) {
                        $shareTo = User::where('username', $data['username'])->first();
                    } else {
                        $shareTo = User::where('email', $data['email'])->first();
                    }
                    if(count($shareTo) == 0) {
                        abort(404, 'User not found.');
                    }
                    $p->user_id = $shareTo->id;
                }
                if($data['mode'] == 'group') {
                    $shareTo = Group::find($data['groupId']);
                    if(empty($shareTo)) {
                        abort(404, 'Group not found.');
                    }
                    $p->group_id = $shareTo->id;
                }
                $collect->permissions()
                    ->save($p);
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getContributedCollection(Collection $collect) {
        $c = $collect->contribution()
            ->first();
        if(empty($c)) {
            return null;
        } else {
            $cArr = $c->makeVisible('updated_at')
                ->toCamelArray();
            $cArr['updatedAt'] = Carbon::createFromFormat('Y-m-d H:i:s', $cArr['updatedAt'])->toIso8601String();
            $role = Permission::where('name', Config::get('userspice.curator.role'))->first();
            $roleId = $role->id;
            $publicShared = $collect->importHistories()
                ->whereExists(function($q) use ($roleId) {
                    $q->select(DB::raw(1))
                        ->from('collections')
                        ->whereRaw('ldshe_collections.id = ldshe_collection_import_histories.to_id')
                        ->where('role_id', $roleId);
                })
                ->orderBy('updated_at', 'desc')
                ->first();
            if($publicShared) {
                $cArr['publicSharedId'] = $publicShared->to_id;
            }
            return $cArr;
        }
    }

    public function contributeCollection(Collection $collect) {
        $c = $collect->contribution;
        if(empty($c)) {
            $c = new ContributionRequest;
            $collect->contribution()
                ->save($c);
        } else {
            $c->status = 'pending';
            $c->save();
        }
    }

    public function reviewCollection(Collection $collect, $status) {
        $c = $collect->contribution()
                ->pending()
                ->first();
        if(empty($c)) {
            throw new ModelNotFoundException('Collection has been Approved or Denied.');
        }
        $c->status = $status;
        $c->save();
    }

    public function recordImportHistory($fromId, $toId) {
        $c = Collection::find($fromId);
        DB::beginTransaction();
        try {
            $h = new CollectionImportHistory;
            $h->id = Uuid::uuid4();
            if(empty($c->owner_id)) {
                $h->from_role = $c->role_id;
            } else {
                $h->from_user = $c->owner_id;
            }
            $h->from_id = $fromId;
            $h->to_id = $toId;
            $h->save();
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function hasCollectionPermissions(Collection $collect, \App\UserSpice\User $user, array $privileges) {
        $userId = $user->data()->id;
        $q = $collect->permissions()
            ->where(function($q) use ($userId) {
                $q->orWhere('mode', 'all')
                    ->orWhere(function($q) use ($userId) {
                        $q->where('user_id', $userId)
                            ->orWhereExists(function($q) use ($userId) {
                                $q->select(DB::raw(1))
                                    ->from('group_user')
                                    ->whereRaw('ldshe_group_user.group_id = ldshe_collection_permissions.group_id')
                                    ->where('status', 'active')
                                    ->where('user_id', $userId);
                            });
                    });
            });
        foreach ($privileges as $p) {
            $q->where($p, true);
        }
        return $q->count() > 0;
    }
}
