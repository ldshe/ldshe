<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreatePatternSessionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pattern_session', function (Blueprint $table) {
            $table->uuid('session_id');
            $table->uuid('pattern_id');
            $table->enum('stage', [
                'pre',
                'in',
                'post',
            ])->nullable();
            $table->unsignedInteger('pos')->nullable();

            $table->primary(['session_id', 'pattern_id']);
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('cascade');
            //Don't apply cascade delete as pattern update happens in destroy-and-recreate style
            //$table->foreign('pattern_id')->references('id')->on('patterns')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pattern_session');
    }
}
