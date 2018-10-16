<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterCoursesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['teaching_time', 'self_study_time']);
            $table->text('purpose')->nullable();
            $table->string('semester')->nullable();
        });
        DB::statement('UPDATE `ldshe_courses` SET `purpose` = "", `semester`=""');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->float('teaching_time', 8, 2)->nullable();
            $table->float('self_study_time', 8, 2)->nullable();
            $table->dropColumn('purpose');
            $table->dropColumn('semester');
        });
    }
}
