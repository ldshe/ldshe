<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterDesignImportHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('design_import_histories', function (Blueprint $table) {
            $table->dropForeign(['from_id']);
            $table->addColumn('integer', 'from_role', ['length' => 11, 'nullable' => true])->after('id');
            $table->addColumn('integer', 'from_user', ['length' => 11, 'nullable' => true])->after('from_role');
        });
        DB::statement('ALTER TABLE ldshe_design_import_histories ADD CONSTRAINT design_import_histories_from_role_foreign FOREIGN KEY(from_role) REFERENCES permissions(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE ldshe_design_import_histories ADD CONSTRAINT design_import_histories_from_user_foreign FOREIGN KEY(from_user) REFERENCES users(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('design_import_histories', function (Blueprint $table) {
            $table->foreign('from_id')->references('id')->on('courses')->onDelete('cascade');
            $table->dropForeign(['from_role']);
            $table->dropForeign(['from_user']);
            $table->dropColumn('from_role');
            $table->dropColumn('from_user');
        });
    }
}
