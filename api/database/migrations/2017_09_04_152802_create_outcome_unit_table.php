<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateOutcomeUnitTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('outcome_unit', function (Blueprint $table) {
            $table->uuid('outcome_id');
            $table->uuid('unit_id');

            $table->primary(['outcome_id', 'unit_id']);
            $table->foreign('outcome_id')->references('id')->on('outcomes')->onDelete('cascade');
            $table->foreign('unit_id')->references('id')->on('units')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('outcome_unit');
    }
}
