<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterCollectionPermissionsTable2 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('collection_permissions', function (Blueprint $table) {
            $table->unsignedInteger('group_id')->nullable()->after('user_id');

            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
        });

        $sql = <<<SQL
ALTER TABLE `ldshe_collection_permissions` modify `mode` enum(
    'all',
    'user',
    'group'
) DEFAULT 'all' NOT NULL
SQL;
        DB::statement($sql);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('collection_permissions', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropColumn('group_id');
        });

        $sql = <<<SQL
ALTER TABLE `ldshe_collection_permissions` modify `mode` enum(
    'all',
    'user'
) DEFAULT 'all' NOT NULL
SQL;
        DB::statement($sql);
    }
}
