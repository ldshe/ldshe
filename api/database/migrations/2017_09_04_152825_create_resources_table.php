<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateResourcesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('item_no');
            $table->enum('type', [
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
                'writing_template',
            ]);
            $table->nullableTimestamps();

            $table->primary(['id', 'item_no']);
            $table->foreign('id')->references('id')->on('patterns')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('resources');
    }
}
