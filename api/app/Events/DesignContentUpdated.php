<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class DesignContentUpdated implements ShouldBroadcast
{
    public $design;

    public function __construct($design)
    {
        $this->design = $design;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('preview.design.'.$this->design['courseId']);
    }
}
