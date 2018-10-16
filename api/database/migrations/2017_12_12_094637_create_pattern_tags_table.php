<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreatePatternTagsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pattern_tags', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('item_no');
            $table->string('type');
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
        Schema::dropIfExists('pattern_tags');
    }
}
