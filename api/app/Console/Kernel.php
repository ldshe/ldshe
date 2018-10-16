<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Laravel\Lumen\Console\Kernel as ConsoleKernel;
use Dusterio\LumenPassport\Console\Commands\Purge;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\ReleaseExpiredMutex::class,
        Commands\RemoveOrphanFile::class,
        Purge::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command(Commands\ReleaseExpiredMutex::class)->everyMinute();
        $schedule->command(Commands\RemoveOrphanFile::class)->daily();
        $schedule->command(Purge::class)->daily();
    }
}
