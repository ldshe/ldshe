<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterSessionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->string('topic')->nullable();
            $table->text('objective')->nullable();
            $table->dateTime('utc_date')->nullable();
        });
        DB::statement('UPDATE `ldshe_sessions` SET topic = "", objective = ""');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropColumn('topic');
            $table->dropColumn('objective');
            $table->dropColumn('utc_date');
        });
    }
}
