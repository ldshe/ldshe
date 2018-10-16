<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Repositories\MutexRepository;

class ReleaseExpiredMutex extends Command
{

    protected $signature = 'mutex:releaseExpired';
    protected $description = 'Release all expired mutex locks';

    protected $repo;

    public function __construct(MutexRepository $repo) {
        parent::__construct();
        $this->repo = $repo;
    }

    public function handle() {
        $this->repo->releaseExpiredLock();
    }
}
