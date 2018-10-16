<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateAdditionalAttachmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('additional_attachments', function (Blueprint $table) {
            $table->string('key');
            $table->string('type');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->uuid('file_id')->nullable();
            $table->unsignedInteger('pos');
            $table->uuid('feedback_id')->nullable();
            $table->uuid('motivator_id')->nullable();
            $table->uuid('resource_id')->nullable();
            $table->uuid('tool_id')->nullable();
            $table->nullableTimestamps();

            $table->unique(['key', 'pos', 'feedback_id']);
            $table->unique(['key', 'pos', 'motivator_id']);
            $table->unique(['key', 'pos', 'resource_id']);
            $table->unique(['key', 'pos', 'tool_id']);
            $table->foreign('file_id')->references('id')->on('files')->onDelete('cascade');
            $table->foreign('feedback_id')->references('id')->on('feedbacks')->onDelete('cascade');
            $table->foreign('motivator_id')->references('id')->on('motivators')->onDelete('cascade');
            $table->foreign('resource_id')->references('id')->on('resources')->onDelete('cascade');
            $table->foreign('tool_id')->references('id')->on('tools')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('additional_attachments');
    }
}
