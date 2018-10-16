<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AlterContributionRequestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('contribution_requests', function (Blueprint $table) {
            $table->unsignedInteger('course_id')->nullable()->change();
            $table->unsignedInteger('collection_id')->nullable()->after('course_id');

            $table->foreign('collection_id')->references('id')->on('collections')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('contribution_requests', function (Blueprint $table) {
            $table->unsignedInteger('course_id')->change();
            $table->dropForeign(['collection_id']);
            $table->dropColumn('collection_id');
        });
    }
}
