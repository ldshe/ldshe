<?php

namespace App\Flysystem;

use InvalidArgumentException;
use League\Flysystem\AdapterInterface;
use League\Flysystem\Filesystem as BaseFilesystem;
use League\Flysystem\Util;
use League\Flysystem\Adapter\CanOverwriteFiles;

class Filesystem extends BaseFilesystem
{
    public function __construct(AdapterInterface $adapter, $config = null)
    {
        parent::__construct($adapter, $config);
    }

    public function putStream($path, $resource, array $config = [])
    {
        if ( ! is_resource($resource)) {
            throw new InvalidArgumentException(__METHOD__ . ' expects argument #2 to be a valid resource.');
        }

        $path = Util::normalizePath($path);
        $config = $this->prepareConfig($config);
        Util::rewindStream($resource);

        if ( ! $this->getAdapter() instanceof CanOverwriteFiles &&$this->has($path)) {
            return $this->getAdapter()->updateStream($path, $resource, $config);
        }

        return $this->getAdapter()->writeStream($path, $resource, $config);
    }
}
