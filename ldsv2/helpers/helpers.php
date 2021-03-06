<?php

if (! function_exists('mix')) {
   function mix($path, $rootPath=null)
   {
       $rootPath = $rootPath ?: __DIR__.'/..';
       $manifestPath = $rootPath.'/mix-manifest.json';
       $manifest = json_decode(file_get_contents($manifestPath), true);
       return '/ldsv2'.$manifest["/dist/$path"];
   }
}

if (! function_exists('start_session')) {
    function start_session($expire = 0)
    {
        if ($expire == 0) {
            $expire = ini_get('session.gc_maxlifetime');
        } else {
            ini_set('session.gc_maxlifetime', $expire);
        }

        if (empty($_COOKIE['PHPSESSID'])) {
            session_set_cookie_params($expire);
            session_start();
        } else {
            session_start();
            setcookie('PHPSESSID', session_id(), time() + $expire);
        }
    }
}
