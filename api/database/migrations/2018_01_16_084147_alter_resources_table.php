<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterResourcesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('resources', function (Blueprint $table) {
            //
        });
        DB::statement('ALTER TABLE `ldshe_resources` MODIFY `type` VARCHAR(255) NOT NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('resources', function (Blueprint $table) {
            //
        });

        $sql = <<<SQL
UPDATE `ldshe_resources` set `type` = null WHERE `type` NOT IN (
    'additional_examples',
    'assessment_rubric',
    'audio',
    'book',
    'book_chapter',
    'checklist',
    'course_session_outline',
    'demo_video',
    'interactive_learning_material',
    'lecture_text',
    'lecture_video',
    'paper',
    'ppt_slides',
    'quiz',
    'sample_work_by_students',
    'survey',
    'task_example',
    'template',
    'tutorial_text',
    'tutorial_video',
    'video',
    'website',
    'worksheet',
    'writing_template'
)
SQL;

        $sql2 = <<<SQL2
ALTER TABLE `ldshe_resources` modify `type` enum(
    'additional_examples',
    'assessment_rubric',
    'audio',
    'book',
    'book_chapter',
    'checklist',
    'course_session_outline',
    'demo_video',
    'interactive_learning_material',
    'lecture_text',
    'lecture_video',
    'paper',
    'ppt_slides',
    'quiz',
    'sample_work_by_students',
    'survey',
    'task_example',
    'template',
    'tutorial_text',
    'tutorial_video',
    'video',
    'website',
    'worksheet',
    'writing_template'
) NOT NULL
SQL2;
        DB::statement($sql);
        DB::statement($sql2);
    }
}
