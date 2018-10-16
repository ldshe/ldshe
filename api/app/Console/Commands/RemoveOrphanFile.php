<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Repositories\FileRepository;

class RemoveOrphanFile extends Command
{
    protected $signature = 'file:removeOrphan';
    protected $description = 'Remove all orphan files from storage';

    protected $repo;

    public function __construct(FileRepository $repo) {
        parent::__construct();
        $this->repo = $repo;
    }

    public function handle() {
        $this->repo->removeOrphan();
    }
}
