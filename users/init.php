<?php
require_once 'classes/class.autoloader.php';
session_start();

$abs_us_root=$_SERVER['DOCUMENT_ROOT'];

$self_path=explode("/", $_SERVER['PHP_SELF']);
$self_path_length=count($self_path);
$file_found=FALSE;

for($i = 1; $i < $self_path_length; $i++){
	array_splice($self_path, $self_path_length-$i, $i);
	$us_url_root=implode("/",$self_path)."/";

	if (file_exists($abs_us_root.$us_url_root.'z_us_root.php')){
		$file_found=TRUE;
		break;
	}else{
		$file_found=FALSE;
	}
}

require_once $abs_us_root.$us_url_root.'users/helpers/helpers.php';

// Set config
$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

$GLOBALS['config'] = array(
    'mysql' => array(
		'host'      => getenv('LDSHE_DB_HOST'),
		'port'      => getenv('LDSHE_DB_PORT'),
		'db'        => getenv('LDSHE_DB_DATABASE'),
        'username'  => getenv('LDSHE_DB_USERNAME'),
        'password'  => getenv('LDSHE_DB_PASSWORD'),
    ),
    'remember' => array(
        'cookie_name'   => 'pmqesoxiw318374csb',
        'cookie_expiry' => 604800  //One week, feel free to make it longer
    ),
    'session' => array(
        'session_name' => 'user',
        'token_name'   => 'token',
    )
);

date_default_timezone_set('Asia/Hong_Kong');

//adding more ids to this array allows people to access everything, whether offline or not. Use caution.
$master_account = [1];

Autoloader::loader('Config');
Autoloader::loader('Cookie');
Autoloader::loader('DB');
Autoloader::loader('Hash');
Autoloader::loader('Input');
Autoloader::loader('Redirect');
Autoloader::loader('Session');
Autoloader::loader('Token');
Autoloader::loader('User');
Autoloader::loader('Validate');
Autoloader::loader('phpmailer/PHPMailerAutoload');

//Check to see if user has a remember me cookie
if(Cookie::exists(Config::get('remember/cookie_name')) && !Session::exists(Config::get('session/session_name'))){
	$hash = Cookie::get(Config::get('remember/cookie_name'));
	$hashCheck = DB::getInstance()->query("SELECT * FROM users_session WHERE hash = ? AND uagent = ?",array($hash,Session::uagent_no_version()));

	if ($hashCheck->count()) {
		$user = new User($hashCheck->first()->user_id);
		$user->login();

	}
}

//Check to see that user is logged in on a temporary password
$user = new User();

//Check to see that user is verified
if($user->isLoggedIn()){
	if($user->data()->email_verified == 0 && $currentPage != 'verify.php' && $currentPage != 'logout.php' && $currentPage != 'verify_thankyou.php'){
		Redirect::to('users/verify.php');
	}
}
