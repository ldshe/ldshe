<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreatePatternsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('patterns', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('course_id')->nullable();
            $table->uuid('unit_id')->nullable();
            $table->uuid('root_id')->nullable();
            $table->enum('patt_type', ['composite', 'activity']);
            $table->enum('sub_type', [
                'revision', 'reflection', 'self_or_peer_assessment',
                'conceptual_or_visual_artefacts', 'tangible_manipulable_artifact', 'presentations_performance_illustration',
                'tangible_or_immersive_investigation', 'explorations_through_conversation', 'information_exploration',
                'test_assessment', 'practice', 'receiving_and_interpreting_information',
            ])->nullable();
            $table->enum('group', ['reflective', 'productive', 'exploratory', 'directed'])->nullable();
            $table->string('fullname')->nullable();
            $table->string('shortname', 50)->nullable();
            $table->text('description')->nullable();
            $table->boolean('assessment')->nullable();
            $table->enum('social_organization', ['group', 'individual', 'peer_review', 'whole_class'])->nullable();
            $table->unsignedInteger('group_size')->nullable();
            $table->enum('setting', [
                'face_to_face_synchronous', 'face_to_face_classroom', 'face_to_face_field_work',
                'informal_on_or_offline', 'online_asynchronous', 'online_synchronous',
            ])->nullable();
            $table->float('duration', 8, 2)->nullable();
            $table->text('note')->nullable();
            $table->string('ref', 50)->nullable();
            $table->float('pos_left', 8, 2)->nullable();
            $table->float('pos_top', 8, 2)->nullable();
            $table->uuid('parent_id')->nullable();
            $table->unsignedInteger('_lft');
            $table->unsignedInteger('_rgt');
            $table->nullableTimestamps();

            $table->primary('id');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->foreign('unit_id')->references('id')->on('units')->onDelete('cascade');
            $table->foreign('root_id')->references('id')->on('patterns')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('patterns')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('patterns');
    }
}
