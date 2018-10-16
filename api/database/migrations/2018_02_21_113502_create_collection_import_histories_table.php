<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateCollectionImportHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('collection_import_histories', function (Blueprint $table) {
            $table->uuid('id');
            $table->unsignedInteger('from_id');
            $table->unsignedInteger('to_id');
            $table->nullableTimestamps();
            $table->foreign('to_id')->references('id')->on('collections')->onDelete('cascade');
        });

        Schema::table('collection_import_histories', function (Blueprint $table) {
            $table->addColumn('integer', 'from_role', ['length' => 11, 'nullable' => true])->after('id');
            $table->addColumn('integer', 'from_user', ['length' => 11, 'nullable' => true])->after('from_role');
        });
        DB::statement('ALTER TABLE ldshe_collection_import_histories ADD CONSTRAINT collection_import_histories_from_role_foreign FOREIGN KEY(from_role) REFERENCES permissions(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE ldshe_collection_import_histories ADD CONSTRAINT collection_import_histories_from_user_foreign FOREIGN KEY(from_user) REFERENCES users(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('collection_import_histories');
    }
}
