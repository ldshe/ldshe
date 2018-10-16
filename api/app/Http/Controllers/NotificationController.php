<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Repositories\NotificationRepository;

class NotificationController extends Controller {

    protected $repo;

    public function __construct(NotificationRepository $repo) {
        $this->repo = $repo;
    }

    public function getAllByOwner(Request $request) {
        $userId = $this->getAuthUser()->data()->id;
        $notifications = $this->repo->getNotificationsByUser($this->getNotifiableUser($userId));
        return response()->json([
            'notifications' => $notifications,
        ], 200);
    }

    public function delete(Request $request, $noteId) {
        $userId = $this->getAuthUser()->data()->id;
        $note = $this->repo->find($this->getNotifiableUser($userId), $noteId);
        if(!empty($note)) {
            if($this->denies('owner-can-curd-notification', $note)) {
                abort(403);
            }
            $note->delete();
        }
        return response()->json([
            'message' => 'Notification deleted.',
        ], 200);
    }
}
