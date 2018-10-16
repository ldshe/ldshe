<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateCoursePermissionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('course_permissions', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('course_id');
            $table->boolean('read')->default(false);
            $table->boolean('import')->default(false);
            $table->enum('mode', ['all', 'user'])->default('all');
            $table->nullableTimestamps();

            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
        });

        Schema::table('course_permissions', function (Blueprint $table) {
            $table->addColumn('integer', 'user_id', ['length' => 11, 'nullable' => true])->after('mode');
        });

        DB::statement('ALTER TABLE ldshe_course_permissions ADD CONSTRAINT course_permissions_user_id_foreign FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('course_permissions');
    }
}
