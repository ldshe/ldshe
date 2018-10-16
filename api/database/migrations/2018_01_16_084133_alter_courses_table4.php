<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterCoursesTable4 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('courses', function (Blueprint $table) {
            //
        });
        DB::statement('ALTER TABLE `ldshe_courses` MODIFY `mode` VARCHAR(255)');
        DB::statement('ALTER TABLE `ldshe_courses` MODIFY `type` VARCHAR(255)');
        DB::statement('ALTER TABLE `ldshe_courses` MODIFY `prerequisite` VARCHAR(255)');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('courses', function (Blueprint $table) {
            //
        });

        $sql = <<<SQL
UPDATE `ldshe_courses` set `mode` = null WHERE `mode` NOT IN (
    'blended',
    'online',
    'face-to-face_only'
)
SQL;

        $sql2 = <<<SQL2
ALTER TABLE `ldshe_courses` modify `mode` enum(
    'blended',
    'online',
    'face-to-face_only'
)
SQL2;
        DB::statement($sql);
        DB::statement($sql2);

        $sql3 = <<<SQL3
UPDATE `ldshe_courses` set `type` = null WHERE `type` NOT IN (
    'core',
    'specialist',
    'electives',
    'independent_project',
    'group_project',
    'dissertation'
)
SQL3;

        $sql4 = <<<SQL4
ALTER TABLE `ldshe_courses` modify `type` enum(
    'core',
    'specialist',
    'electives',
    'independent_project',
    'group_project',
    'dissertation'
)
SQL4;
        DB::statement($sql3);
        DB::statement($sql4);

        $sql5 = <<<SQL5
UPDATE `ldshe_courses` set `prerequisite` = null WHERE `prerequisite` NOT IN (
    'not_applicable',
    'bachelor_degree',
    'university_entrance_requirements'
)
SQL5;

        $sql6 = <<<SQL6
ALTER TABLE `ldshe_courses` modify `prerequisite` enum(
    'not_applicable',
    'bachelor_degree',
    'university_entrance_requirements'
)
SQL6;
        DB::statement($sql5);
        DB::statement($sql6);
    }
}
