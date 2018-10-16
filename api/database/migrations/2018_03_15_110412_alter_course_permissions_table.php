<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterCoursePermissionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('course_permissions', function (Blueprint $table) {
            $table->boolean('edit')->default(false)->after('import');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('course_permissions', function (Blueprint $table) {
            $table->dropColumn('edit');
        });
    }
}
