<?php

return [
    'heartbeat_timeout' => env('LDSHE_MUTEX_HEARTBEAT_TIMEOUT', '60'), //seconds
    'idle_timeout' => env('LDSHE_MUTEX_IDLE_TIMEOUT', '1800'), //seconds
];
