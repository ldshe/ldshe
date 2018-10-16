<?php

namespace App\Repositories;

use Carbon\Carbon;
use Config;
use DB;
use Exception;
use App\Models\Course;
use App\Models\CoursePermission;
use App\Models\ContributionRequest;
use App\Models\DesignImportHistory;
use App\Models\Group;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Ramsey\Uuid\Uuid;

class CourseRepository {

    public function getByOwner(\App\UserSpice\User $user, $filterQ=null) {
        $userId = $user->data()->id;
        $role = Permission::where('name', Config::get('userspice.curator.role'))->first();
        $roleId = $role->id;
        $q = Course::where('owner_id', $userId);
        if(!empty($filterQ)) {
            $filterQ($q);
        }
        $courses = $q->get()
            ->makeVisible('id');
        return $courses->map(function($c) use ($roleId) {
            $shared = false;
            $shared = $c->permissions->count() > 0;
            if(!$shared) {
                $shared = $c->importHistories()
                    ->whereExists(function($q) use ($roleId) {
                        $q->select(DB::raw(1))
                            ->from('courses')
                            ->whereRaw('ldshe_courses.id = ldshe_design_import_histories.to_id')
                            ->where('role_id', $roleId);
                    })
                    ->count() > 0;
            }
            $cArr = $c->toCamelArray();
            $cArr['shared'] = $shared;
            return $cArr;
        });
    }

    public function getRecentlyByOwner(\App\UserSpice\User $user) {
        $filterQ = function($q) {
            $q->orderBy('updated_at', 'desc')
                ->take(5);
        };
        return $this->getByOwner($user, $filterQ);
    }

    public function getByCurator() {
        $role = Permission::where('name', Config::get('userspice.curator.role'))->first();
        $roleId = $role->id;
        $courses = Course::where('role_id', $roleId)
            ->get()
            ->makeVisible('id');
        return $courses->map(function($c) {
            $shared = $c->permissions->count() > 0;
            $cArr = $c->toCamelArray();
            $cArr['shared'] = $shared;
            $cArr['owner'] = '';
            $src = DesignImportHistory::where('to_id', $c->id)
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

    private function getBySharedHelper(\App\UserSpice\User $user, $mode='all', $showOwned=false, $filterQ=null, $permitQ=null) {
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
                            ->whereRaw('ldshe_group_user.group_id = ldshe_course_permissions.group_id')
                            ->where('status', 'active')
                            ->where('user_id', $userId);
                    });
                });
            }
            if(!empty($permitQ)) {
                $permitQ($q);
            }
        };
        $q = Course::whereHas('permissions', $permitCondQ);
        if(!$showOwned) {
            $q->where(function($q) use ($userId) {
                $q->orWhereNull('owner_id')
                    ->orWhere('owner_id', '<>', $userId);
            });
        }
        if(!empty($filterQ)) {
            $filterQ($q);
        }
        $courses = $q->get()
            ->makeVisible('id');
        return $courses->map(function($c) use ($mode, $permitCondQ){
            $cArr = $c->toCamelArray();
            $cArr['owner'] = '';
            if($mode == 'all') {
                $src = DesignImportHistory::where('to_id', $c->id)
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
            $cArr['permission'] = $c->groupedPermission($permitCondQ)->first();
            return $cArr;
        });
    }

    public function getByShared(\App\UserSpice\User $user, $mode) {
        return $this->getBySharedHelper($user, $mode);
    }

    public function getBySharedGroup(\App\UserSpice\User $user, $groupId) {
        $permitQ = function($q) use ($groupId) {
            $q->where('group_id', $groupId);
        };
        return $this->getBySharedHelper($user, 'group', true, null, $permitQ);
    }

    public function getRecentlyByShared(\App\UserSpice\User $user) {
        $userId = $user->data()->id;
        $sql = 'SELECT c.id FROM ';
        $sql .= "    ldshe_courses as c, ldshe_course_permissions as p ";
        $sql .= "WHERE c.id = p.course_id ";
        $sql .= "AND ( ";
        $sql .= "  owner_id IS null ";
        $sql .= "  OR owner_id <> ? ";
        $sql .= ") ";
        $sql .= "AND p.id = ( ";
        $sql .= "    SELECT id FROM ldshe_course_permissions pp ";
        $sql .= "    WHERE c.id = course_id ";
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
                $c = Course::find($r->id)
                    ->makeVisible('id');
                $cArr = $c->toCamelArray();
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

    public function getByContributed($status='pending') {
        return ContributionRequest::designType()
            ->pending()
            ->get()
            ->map(function($r) {
                $c = $r->course()
                    ->first()
                    ->makeVisible('id');
                $owner = User::find($c->owner_id);
                $cArr = $c->toCamelArray();
                $cArr['owner'] = $owner->fname.' '.$owner->lname;
                return $cArr;
            });
    }

    public function create(\App\UserSpice\User $user) {
        DB::beginTransaction();
        try {
            $userId = $user->data()->id;
            $course = new Course;
            $course->owner_id = $userId;
            $course->save();
            DB::commit();
            return $course->id;
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function createCurated() {
        DB::beginTransaction();
        try {
            $course = new Course;
            $role = Permission::where('name', Config::get('userspice.curator.role'))->first();
            $course->role_id = $role->id;
            $course->save();

            $p = new CoursePermission;
            $p->id = Uuid::uuid4();
            $p->mode = 'all';
            $p->read = true;
            $p->import = true;
            $course->permissions()
                ->save($p);

            DB::commit();
            return $course->id;
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function find($id) {
        return Course::findOrFail($id);
    }

    public function get($id) {
        $course = $this->find($id);
        return $course->toCamelArray();
    }

    public function countDuplicatedTitles(Course $course, $title) {
        if(!empty($course->owner_id)) {
            $q = Course::where('owner_id', $course->owner_id);
        } else {
            $q = Course::where('role_id', $course->role_id);
        }
        $espTitle = preg_replace('/\\\\/', '\\\\\\\\', preg_quote($title));
        $espTitle = str_replace("'", "''", $espTitle);
        return $q->whereRaw("`title` REGEXP '^(".$espTitle.")( - Copy \\\\([[:digit:]]+\\\\))*'")
            ->count();
    }

    public function update($id, $field) {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($id);
            foreach($field as $name => $value) {
                $course->$name = $value;
            }
            $course->save();
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($id) {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($id);
            $course->delete();
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function refreshAt($id, Carbon $at=null) {
        if(is_null($at)) {
            $at = Carbon::now(env('APP_TIMEZONE'))->timestamp;
        }
        DB::beginTransaction();
        try {
            $course = Course::find($id);
            $course->refreshed_at = $at;
            $course->save();
            DB::commit();
            return $at;
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getShare(Course $course) {
        return $course->permissions()
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

    public function share(Course $course, $data) {
        DB::beginTransaction();
        try {
            $q = $course->permissions()
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
                $p = new CoursePermission;
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
                $course->permissions()
                    ->save($p);
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getContribution(Course $course) {
        $c = $course->contribution()
            ->first();
        if(empty($c)) {
            return null;
        } else {
            $cArr = $c->makeVisible('updated_at')
                ->toCamelArray();
            $cArr['updatedAt'] = Carbon::createFromFormat('Y-m-d H:i:s', $cArr['updatedAt'])->toIso8601String();
            $role = Permission::where('name', Config::get('userspice.curator.role'))->first();
            $roleId = $role->id;
            $publicShared = $course->importHistories()
                ->whereExists(function($q) use ($roleId) {
                    $q->select(DB::raw(1))
                        ->from('courses')
                        ->whereRaw('ldshe_courses.id = ldshe_design_import_histories.to_id')
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

    public function contribute(Course $course) {
        $c = $course->contribution;
        if(empty($c)) {
            $c = new ContributionRequest;
            $course->contribution()
                ->save($c);
        } else {
            $c->status = 'pending';
            $c->save();
        }
    }

    public function review(Course $course, $status) {
        $c = $course->contribution()
                ->pending()
                ->first();
        if(empty($c)) {
            throw new ModelNotFoundException('Design has been Approved or Denied.');
        }
        $c->status = $status;
        $c->save();
    }

    public function recordImportHistory($fromId, $toId) {
        $c = $this->find($fromId);
        DB::beginTransaction();
        try {
            $h = new DesignImportHistory;
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

    public function hasPermissions(Course $course, \App\UserSpice\User $user, array $privileges) {
        $userId = $user->data()->id;
        $q = $course->permissions()
            ->where(function($q) use ($userId) {
                $q->orWhere('mode', 'all')
                    ->orWhere(function($q) use ($userId) {
                        $q->where('user_id', $userId)
                            ->orWhereExists(function($q) use ($userId) {
                                $q->select(DB::raw(1))
                                    ->from('group_user')
                                    ->whereRaw('ldshe_group_user.group_id = ldshe_course_permissions.group_id')
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
