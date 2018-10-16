<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateOutcomesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('outcomes', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('course_id')->nullable();
            $table->enum('type', ['disciplinary_knowledge', 'disciplinary_skills', 'generic_skills'])->nullable();
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
        Schema::dropIfExists('outcomes');
    }
}
