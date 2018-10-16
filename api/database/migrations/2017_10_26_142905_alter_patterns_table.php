<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterPatternsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('patterns', function (Blueprint $table) {
            $table->string('due_date')->nullable();
        });
        DB::statement('ALTER TABLE `ldshe_patterns` MODIFY `sub_type` VARCHAR(255)');
        DB::statement('UPDATE `ldshe_patterns` SET `due_date` = ""');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('patterns', function (Blueprint $table) {
            $table->dropColumn('due_date');
        });
        $sql = <<<SQL
        UPDATE `ldshe_patterns` set `sub_type` = null WHERE `sub_type` NOT IN (
            'revision', 'reflection', 'self_or_peer_assessment',
            'conceptual_or_visual_artefacts', 'tangible_manipulable_artifact', 'presentations_performance_illustration',
            'tangible_or_immersive_investigation', 'explorations_through_conversation', 'information_exploration',
            'test_assessment', 'practice', 'receiving_and_interpreting_information'
        )
SQL;
        $sql2 = <<<SQL2
        ALTER TABLE `ldshe_patterns` modify `sub_type` enum(
            'revision', 'reflection', 'self_or_peer_assessment',
            'conceptual_or_visual_artefacts', 'tangible_manipulable_artifact', 'presentations_performance_illustration',
            'tangible_or_immersive_investigation', 'explorations_through_conversation', 'information_exploration',
            'test_assessment', 'practice', 'receiving_and_interpreting_information'
        )
SQL2;
        DB::statement($sql);
        DB::statement($sql2);
    }
}
