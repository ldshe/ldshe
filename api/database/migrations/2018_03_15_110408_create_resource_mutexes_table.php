<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResourceMutexesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('resource_mutexes', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('course_id')->nullable();
            $table->unsignedInteger('collection_id')->nullable();
            $table->dateTime('keep_alive')->nullable();
            $table->dateTime('last_active')->nullable();
            $table->nullableTimestamps();

            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->foreign('collection_id')->references('id')->on('collections')->onDelete('cascade');
        });

        Schema::table('resource_mutexes', function (Blueprint $table) {
            $table->addColumn('integer', 'user_id', ['length' => 11])->after('id');
        });

        DB::statement('ALTER TABLE ldshe_resource_mutexes ADD CONSTRAINT resource_mutexes_user_id_foreign FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('resource_mutexes');
    }
}
