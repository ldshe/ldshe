<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;

class NotifiableUser extends BaseModel {

    use Notifiable;

    protected $guarded = [];
}
