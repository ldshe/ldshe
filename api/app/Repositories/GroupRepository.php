<?php

namespace App\Repositories;

use Carbon\Carbon;
use DB;
use Exception;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class GroupRepository {

    public function getGroupsByMember(\App\UserSpice\User $user) {
        $userId = $user->data()->id;
        $groups = Group::where('owner_id', $userId)
            ->orWhere(function($q) use ($userId) {
                $q->whereExists(function($q) use ($userId) {
                    $q->select(DB::raw(1))
                        ->from('group_user')
                        ->whereRaw('ldshe_group_user.group_id = ldshe_groups.id')
                        ->where('status', 'active')
                        ->where('user_id', $userId);
                });
            })
            ->get()
            ->makeVisible('id');
        return $groups->map(function($g) use ($userId) {
            $gArr = $g->toCamelArray();
            $gArr['size'] = $g->members()->activeMembers()->count();
            $gArr['isEditable'] = $g->owner_id == $userId;
            $gArr['owner'] = $g->owner->fname.' '.$g->owner->lname;
            return $gArr;
        });
    }

    public function getRecentlyGroupsByMember(\App\UserSpice\User $user) {
        $userId = $user->data()->id;
        $groups = User::find($userId)
            ->groups()
            ->orderBy('pivot_joined_at', 'desc')
            ->take(5)
            ->get()
            ->makeVisible('id')
            ->makeHidden('pivot');
        return $groups->map(function($g) use ($userId) {
            $gArr = $g->toCamelArray();
            $gArr['size'] = $g->members()->activeMembers()->count();
            $gArr['owner'] = $g->owner->fname.' '.$g->owner->lname;
            return $gArr;
        });
    }

    public function create(\App\UserSpice\User $user, $name) {
        DB::beginTransaction();
        try {
            $userId = $user->data()->id;
            $group = new Group;
            $group->owner_id = $userId;
            $group->name = $name;
            $group->save();
            DB::commit();
            $now = Carbon::now(env('APP_TIMEZONE'));
            $joinedAt = $now->toDateTimeString();
            $group->members()->attach($userId, ['status' => 'active', 'joined_at' => $joinedAt]);
            return $group->id;
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function find($id) {
        return Group::findOrFail($id);
    }

    public function update(Group $group, $field) {
        DB::beginTransaction();
        try {
            foreach($field as $name => $value) {
                $group->$name = $value;
            }
            $group->save();
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete(Group $group) {
        DB::beginTransaction();
        try {
            $group->delete();
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function toMembersArray($group, $members, $manageable=false) {
        return $members->map(function($m) use ($group, $manageable) {
            $m->makeVisible('id');
            $mArr = $m->toCamelArray();
            $mArr['isOwner'] = $m->id == $group->owner_id;
            $mArr['fullname'] = $mArr['fname'].' '.$mArr['lname'];
            if($manageable) {
                $mArr['status'] = $m->pivot->status;
            }
            unset($mArr['fname']);
            unset($mArr['lname']);
            return $mArr;
        });
    }

    public function getManageableMembers(Group $group) {
        return $this->toMembersArray($group, $group->members, true);
    }

    public function getActiveMembers(Group $group) {
        return $this->toMembersArray(
            $group,
            $group->members()
                ->activeMembers()
                ->get()
        );
    }

    public function addMember(Group $group, $userId, $callback) {
        $user = User::find($userId);
        if(empty($user)) {
            abort(404, 'User not found.');
        }
        if($this->isMember($group, $userId)) {
            abort(409, 'User is in the member list.');
        } else {
            DB::beginTransaction();
            try {
                $group->members()
                    ->attach($userId);
                $callback();
                DB::commit();
            } catch(Exception $e) {
                DB::rollBack();
                throw $e;
            }
        }
    }

    public function join(Group $group, $userId, $isAccept) {
        $member = $group->members()
            ->wherePivot('user_id', $userId)
            ->first();
        if(empty($member)) {
            abort('404', 'You are not in the member list.');
        }
        switch($member->pivot->status) {
            case 'active': abort(409, 'You have accepted the invitation before.');
            case 'invitation_rejected': abort(409, 'You have rejected the invitation before.');
            case 'invitation_expired': abort(409, 'Invitation expired.');
            case 'left': abort(409, 'You have left the Group.');
        }
        DB::beginTransaction();
        try {
            $q = $group->members();
            if($isAccept) {
                $now = Carbon::now(env('APP_TIMEZONE'));
                $joinedAt = $now->toDateTimeString();
                $q->updateExistingPivot($userId, ['status' => 'active', 'joined_at' => $joinedAt]);
            } else {
                $q->updateExistingPivot($userId, ['status' => 'invitation_rejected']);
            }
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function leave(Group $group, $userId) {
        DB::beginTransaction();
        try {
            $group->members()
                ->wherePivot('status', 'active')
                ->updateExistingPivot($userId, ['status' => 'left']);
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteMember(Group $group, $userId) {
        DB::beginTransaction();
        try {
            $group->members()
                ->detach($userId);
            DB::commit();
        } catch(Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function isMember(Group $group, $userId) {
        return $group->members()
            ->where('id', $userId)
            ->exists();
    }

    public function isActiveMember(Group $group, $userId) {
        return $group->members()
            ->activeMembers()
            ->where('id', $userId)
            ->exists();
    }
}
