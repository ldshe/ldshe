<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterPatternsTable3 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('patterns', function (Blueprint $table) {
            $table->unsignedInteger('group_size_max')->nullable()->after('group_size');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('patterns', function (Blueprint $table) {
            $table->dropColumn('group_size_max');
        });
    }
}
