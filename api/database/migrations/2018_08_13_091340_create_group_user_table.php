<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateGroupUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('group_user', function (Blueprint $table) {
            $table->unsignedInteger('group_id');

            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
        });

        Schema::table('group_user', function (Blueprint $table) {
            $table->addColumn('integer', 'user_id', ['length' => 11])->after('group_id');

            $table->primary(['group_id', 'user_id']);
        });

        DB::statement('ALTER TABLE ldshe_group_user ADD CONSTRAINT group_user_user_id_foreign FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('group_user');
    }
}
