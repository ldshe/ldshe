<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateDesignImportHistories extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('design_import_histories', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('from_id');
            $table->unsignedInteger('to_id');
            $table->nullableTimestamps();
            $table->foreign('from_id')->references('id')->on('courses')->onDelete('cascade');
            $table->foreign('to_id')->references('id')->on('courses')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('design_import_histories');
    }
}
