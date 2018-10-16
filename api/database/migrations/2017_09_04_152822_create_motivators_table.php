<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateMotivatorsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('motivators', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('item_no');
            $table->enum('type', [
                'badges',
                'leaderboard',
                'peer_competition',
                'peer_response_quantity_and_quality',
                'score',
                'team_agency',
                'individual_agency',
                'extra_activities',
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
        Schema::dropIfExists('motivators');
    }
}
