<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;

use App\Events\NewUserNotification;
use App\Notifications\GroupInvitation;
use App\Repositories\GroupRepository;

class GroupController extends Controller {

    protected $repo;

    public function __construct(GroupRepository $repo) {
        $this->repo = $repo;
    }

    public function getAllByMember(Request $request) {
        $user = $this->getAuthUser();
        $groups = $this->repo
            ->getGroupsByMember($user);
        return response()->json([
            'groups' => $groups,
        ], 200);
    }

    public function getRecentlyByMember(Request $request) {
        $user = $this->getAuthUser();
        $groups = $this->repo
            ->getRecentlyGroupsByMember($user);
        return response()->json([
            'groups' => $groups,
        ], 200);
    }

    public function get(Request $request, $groupId) {
        $group = $this->repo->find($groupId);
        if($this->denies('owner-can-curd-group', $group) &&
            $this->denies('member-can-preview-group', $group)) {
            abort(403);
        }
        $user = $this->getAuthUser();
        $gArr = $group->toCamelArray();
        $gArr['isOwner'] = $group->owner_id == $user->data()->id;
        $resp = [
            'groupId' => $group->id,
            'isEditable' => $this->allows('owner-can-curd-group', $group),
            'data' => [
                'group' => $gArr,
            ],
        ];
        return response()->json($resp);
    }

    public function create(Request $request) {
        $user = $this->getAuthUser();
        $name = $request->input('name');
        $id = $this->repo->create($user, $name);
        return response()->json([
            'message' => 'Group created.',
            'groupId' => $id,
        ], 201);
    }

    public function update(Request $request, $groupId) {
        $group = $this->repo->find($groupId);
        if($this->denies('owner-can-curd-group', $group)) {
            abort(403);
        }
        $data = $request->input('data');
        $this->repo->update($group, $data);
        return response()->json([
            'message' => 'Group updated.',
        ], 200);
    }

    public function delete(Request $request, $groupId) {
        $group = $this->repo->find($groupId);
        if($this->denies('owner-can-curd-group', $group)) {
            abort(403);
        }
        $this->repo->delete($group);
        return response()->json([
            'message' => 'Group deleted.',
        ], 200);
    }

    public function getAllMembersByMember(Request $request, $groupId) {
        $group = $this->repo->find($groupId);
        if($this->allows('member-can-preview-group', $group)) {
            $members = $this->repo->getActiveMembers($group);
        } else {
            abort(403);
        }
        return response()->json([
            'members' => $members,
        ], 200);
    }

    public function getAllMembersByOwner(Request $request, $groupId) {
        $group = $this->repo->find($groupId);
        if($this->allows('owner-can-curd-group', $group)) {
            $members = $this->repo->getManageableMembers($group);
        } else {
            abort(403);
        }
        return response()->json([
            'members' => $members,
        ], 200);
    }

    public function joinGroup(Request $request, $groupId, $userId) {
        $group = $this->repo->find($groupId);
        if($this->denies('invitee-can-join-group', $group)) {
            abort(403);
        }
        $isAccept = $request->input('isAccept');
        $this->repo->join($group, $userId, $isAccept);
        return response()->json([
            'message' => 'Group join status updated.',
        ], 200);
    }

    public function leaveGroup(Request $request, $groupId, $userId) {
        $group = $this->repo->find($groupId);
        if($this->denies('member-can-preview-group', $group)) {
            abort(403);
        }
        $this->repo->leave($group, $userId);
        return response()->json([
            'message' => 'Group left status updated.',
        ], 200);
    }

    public function addMember(Request $request, $groupId) {
        $group = $this->repo->find($groupId);
        if($this->denies('owner-can-curd-group', $group)) {
            abort(403);
        }
        $userId = $request->input('userId');
        $groupId = $group->id;
        $groupName = $group->name;
        $inviter = $this->getAuthUser();
        $inviter = $inviter->data()->fname.' '.$inviter->data()->lname;
        $msg = [
            'from' => $inviter,
            'memberId' => $userId,
            'groupId' => $groupId,
            'groupName' => $groupName,
        ];
        $this->repo->addMember($group, $userId, function() use ($userId, &$msg) {
            $this->getNotifiableUser($userId)->notify(new GroupInvitation($msg));
            event(new NewUserNotification($msg));
        });
        return response()->json([
            'message' => 'Invitation sent.',
        ], 200);
    }

    public function deleteMember(Request $request, $groupId, $userId) {
        $group = $this->repo->find($groupId);
        if($this->denies('owner-can-curd-group', $group)) {
            abort(403);
        }
        $this->repo->deleteMember($group, $userId);
        return response()->json([
            'message' => 'Member deleted.',
        ], 200);
    }
}
