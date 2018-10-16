<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterFeedbacksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            //
        });
        DB::statement('ALTER TABLE `ldshe_feedbacks` MODIFY `type` VARCHAR(255) NOT NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            //
        });

        $sql = <<<SQL
UPDATE `ldshe_feedbacks` set `type` = null WHERE `type` NOT IN (
    'group_feedback',
    'automated_feedback',
    'individual_feedback',
    'peer_review_feedback',
    'score'
)
SQL;

        $sql2 = <<<SQL2
ALTER TABLE `ldshe_feedbacks` modify `type` enum(
    'group_feedback',
    'automated_feedback',
    'individual_feedback',
    'peer_review_feedback',
    'score'
) NOT NULL
SQL2;
        DB::statement($sql);
        DB::statement($sql2);
    }
}
