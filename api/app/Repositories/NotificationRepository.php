<?php

namespace App\Repositories;

use Carbon\Carbon;
use Illuminate\Notifications\DatabaseNotification;

use App\Models\NotifiableUser;

class NotificationRepository {

    public function getNotificationsByUser(NotifiableUser $user) {
        return $user->notifications
            ->makeHidden(['created_at', 'updated_at', 'read_at', 'notifiable_id', 'notifiable_type'])
            ->map(function($n) {
                $nArr = $n->toArray();
                $nArr['createdAt'] = Carbon::createFromFormat('Y-m-d H:i:s', $n->created_at)->toIso8601String();
                return $nArr;
            });
    }

    public function find(NotifiableUser $user, $noteId) {
        return $user->notifications()
            ->find($noteId);
    }
}
