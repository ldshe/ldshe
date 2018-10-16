<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterCoursesTable5 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('ALTER TABLE ldshe_courses MODIFY column owner_id int(11)');
        DB::statement('ALTER TABLE ldshe_courses ADD column role_id int(11) AFTER id');
        //CASCADE DELETE on role_id is not added
        //to avoid accidentally deletion of Public Designs when doing the role assignment
        //through the UserSpice Admin Dashboard
        DB::statement('ALTER TABLE ldshe_courses ADD CONSTRAINT courses_role_id_foreign FOREIGN KEY(role_id) REFERENCES permissions(id)');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign('courses_role_id_foreign');
            $table->dropColumn('role_id');
        });
        DB::statement('ALTER TABLE ldshe_courses MODIFY column owner_id int(11) NOT NULL');
    }
}
