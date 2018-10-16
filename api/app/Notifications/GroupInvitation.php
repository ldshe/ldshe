<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class GroupInvitation extends Notification
{
    public $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database'];
    }


    public function toDatabase($notifiable)
    {
        $m = $this->message;
        $m['title'] = 'Group Invitation';
        return $m;
    }
}
