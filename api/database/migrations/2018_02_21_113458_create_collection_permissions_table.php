<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateCollectionPermissionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('collection_permissions', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('collection_id');
            $table->boolean('read')->default(false);
            $table->boolean('import')->default(false);
            $table->enum('mode', ['all', 'user'])->default('all');
            $table->nullableTimestamps();

            $table->foreign('collection_id')->references('id')->on('collections')->onDelete('cascade');
        });

        Schema::table('collection_permissions', function (Blueprint $table) {
            $table->addColumn('integer', 'user_id', ['length' => 11, 'nullable' => true])->after('mode');
        });

        DB::statement('ALTER TABLE ldshe_collection_permissions ADD CONSTRAINT collection_permissions_user_id_foreign FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('collection_permissions');
    }
}
