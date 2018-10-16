<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateToolsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('item_no');
            $table->enum('type', [
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
                'wiki',
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
        Schema::dropIfExists('tools');
    }
}
