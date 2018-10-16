<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class CollectionContentUpdated implements ShouldBroadcast
{
    public $collection;

    public function __construct($collection)
    {
        $this->collection = $collection;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('preview.collection.'.$this->collection['collectId']);
    }
}
