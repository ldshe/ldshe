<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateUnitsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('units', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('course_id')->nullable();
            $table->string('title')->nullable();
            $table->string('approach')->nullable();
            $table->boolean('assessment')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('pos')->nullable();
            $table->nullableTimestamps();

            $table->primary('id');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('units');
    }
}
