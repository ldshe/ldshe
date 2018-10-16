<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterMotivatorsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('motivators', function (Blueprint $table) {
            //
        });
        DB::statement('ALTER TABLE `ldshe_motivators` MODIFY `type` VARCHAR(255) NOT NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('motivators', function (Blueprint $table) {
            //
        });

        $sql = <<<SQL
UPDATE `ldshe_motivators` set `type` = null WHERE `type` NOT IN (
    'badges',
    'leaderboard',
    'peer_competition',
    'peer_response_quantity_and_quality',
    'score',
    'team_agency',
    'individual_agency',
    'extra_activities'
)
SQL;
        $sql2 = <<<SQL2
ALTER TABLE `ldshe_motivators` modify `type` enum(
    'badges',
    'leaderboard',
    'peer_competition',
    'peer_response_quantity_and_quality',
    'score',
    'team_agency',
    'individual_agency',
    'extra_activities'
) NOT NULL
SQL2;
        DB::statement($sql);
        DB::statement($sql2);
    }
}
