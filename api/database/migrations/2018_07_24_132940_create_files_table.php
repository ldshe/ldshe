<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CreateFilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('files', function (Blueprint $table) {
            $table->uuid('id');
            $table->string('name')->nullable();
            $table->string('content_type')->nullable();
            $table->unsignedInteger('size')->nullable();
            $table->string('path')->nullable();
            $table->date('delete_at')->nullable();
            $table->nullableTimestamps();

            $table->primary('id');
        });

        Schema::table('files', function (Blueprint $table) {
            $table->addColumn('integer', 'owner_id', ['length' => 11])->after('id');
        });

        DB::statement('ALTER TABLE ldshe_files ADD CONSTRAINT files_owner_id_foreign FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('files');
    }
}
