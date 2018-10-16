<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreatePatternDependenciesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pattern_dependencies', function (Blueprint $table) {
            $table->uuid('parent_id');
            $table->uuid('source_id')->nullable();
            $table->uuid('target_id');
            $table->nullableTimestamps();

            $table->foreign('parent_id')->references('id')->on('patterns')->onDelete('cascade');
            $table->foreign('source_id')->references('id')->on('patterns')->onDelete('cascade');
            $table->foreign('target_id')->references('id')->on('patterns')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pattern_dependencies');
    }
}
