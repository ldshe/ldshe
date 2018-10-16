<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterToolsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tools', function (Blueprint $table) {
            //
        });
        DB::statement('ALTER TABLE `ldshe_tools` MODIFY `type` VARCHAR(255) NOT NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tools', function (Blueprint $table) {
            //
        });

        $sql = <<<SQL
UPDATE `ldshe_tools` set `type` = null WHERE `type` NOT IN (
    'blog',
    'brainstorming_tool',
    'chatroom',
    'discussion_forum',
    'e_portfolio',
    'lms_moodle',
    'mind_mapping_tool',
    'online_assign_submission',
    'online_shared_drive',
    'online_shared_workspace',
    'programming_language',
    'quiz_tool',
    'survey_tool',
    'survey_poll',
    'video_quiz',
    'wiki'
)
SQL;
        $sql2 = <<<SQL2
ALTER TABLE `ldshe_tools` modify `type` enum(
    'blog',
    'brainstorming_tool',
    'chatroom',
    'discussion_forum',
    'e_portfolio',
    'lms_moodle',
    'mind_mapping_tool',
    'online_assign_submission',
    'online_shared_drive',
    'online_shared_workspace',
    'programming_language',
    'quiz_tool',
    'survey_tool',
    'survey_poll',
    'video_quiz',
    'wiki'
) NOT NULL
SQL2;
        DB::statement($sql);
        DB::statement($sql2);
    }
}
