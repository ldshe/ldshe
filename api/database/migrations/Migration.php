<?php

use Illuminate\Database\Migrations\Migration as Base;

class Migration extends Base
{
    public function __construct()
    {
        /**Workaround for enum type not supported by Doctrine
         * [Doctrine\DBAL\DBALException]
         * Unknown database type enum requested, Doctrine\DBAL\Platforms\MySQL57Platform may not
         * support it.**/
        DB::getDoctrineSchemaManager()->getDatabasePlatform()->registerDoctrineTypeMapping('enum', 'string');
    }
}
