<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateFeedbacksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('item_no');
            $table->enum('type', [
                'group_feedback',
                'automated_feedback',
                'individual_feedback',
                'peer_review_feedback',
                'score',
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
        Schema::dropIfExists('feedbacks');
    }
}
