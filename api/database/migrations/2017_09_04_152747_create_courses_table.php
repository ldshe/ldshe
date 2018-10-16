<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateCoursesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title')->nullable();
            $table->string('subject')->nullable();
            $table->string('teacher')->nullable();
            $table->unsignedInteger('class_size')->nullable();
            $table->unsignedInteger('session_num')->nullable();
            $table->enum('mode', ['blended', 'online', 'face-to-face_only'])->nullable();
            $table->float('teaching_time', 8, 2)->nullable();
            $table->float('self_study_time', 8, 2)->nullable();
            $table->enum('type', ['core', 'specialist', 'electives', 'independent_project', 'group_project', 'dissertation'])->nullable();
            $table->enum('prerequisite', ['not_applicable', 'bachelor_degree', 'university_entrance_requirements'])->nullable();
            $table->nullableTimestamps();
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->addColumn('integer', 'owner_id', ['length' => 11])->after('id');
        });

        DB::statement('ALTER TABLE ldshe_courses ADD CONSTRAINT courses_owner_id_foreign FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('courses');
    }
}
