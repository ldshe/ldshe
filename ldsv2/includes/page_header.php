<?php
function get_echo($cb, $args=[]) {
    ob_start();
    call_user_func_array($cb, $args);
    return ob_get_clean();
};

header('X-Frame-Options: SAMEORIGIN');

require_once $abs_us_root.$us_url_root.'users/includes/user_spice_ver.php';
require_once $abs_us_root.$us_url_root.'users/helpers/helpers.php';

$currentPage = currentPage();

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

$err = '';
$msg = '';
if(isset($_GET['err'])){
	$err = Input::get('err');
}

if(isset($_GET['msg'])){
	$msg = Input::get('msg');
}

if(file_exists($abs_us_root.$us_url_root.'usersc/'.$currentPage)){
	if(currentFolder()!= 'usersc'){
		$url = $us_url_root.'usersc/'.$currentPage;
		if(isset($_GET)){
			$url .= '?'; //add initial ?
			foreach ($_GET as $key=>$value){
				$url .= '&'.$key.'='.$value;
			}
		}
		Redirect::to($url);
	}
}

$db = DB::getInstance();
$settingsQ = $db->query("Select * FROM settings");
$settings = $settingsQ->first();

//dealing with if the user is logged in
if($user->isLoggedIn()){
	if (($settings->site_offline==1) && (!in_array($user->data()->id, $master_account)) && ($currentPage != 'login.php')){
		die("The site is currently offline.");
	}
}

//deal with non logged in users
if(!$user->isLoggedIn()){
	if (($settings->site_offline==1) && ($currentPage != 'login.php')){
		die("The site is currently offline.");
	}
}
//notifiy master_account that the site is offline
if($user->isLoggedIn()){
	if (($settings->site_offline==1) && (in_array($user->data()->id, $master_account)) && ($currentPage != 'login.php')){
		$err = get_echo(err, ["<br>The site is currently offline."]);
	}
}

if($settings->glogin==1 && !$user->isLoggedIn()){
	require_once $abs_us_root.$us_url_root.'users/includes/google_oauth.php';
}

if ($settings->force_ssl==1){

	if (!isset($_SERVER['HTTPS']) || !$_SERVER['HTTPS']) {
		// if request is not secure, redirect to secure url
		$url = 'https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
		Redirect::to($url);
		exit;
	}
}

//if track_guest enabled AND there is a user logged in
if($settings->track_guest == 1 && $user->isLoggedIn()){
	if ($user->isLoggedIn()){
		$user_id=$user->data()->id;
	}else{
		$user_id=0;
	}
	new_user_online($user_id);
}

if(file_exists($abs_us_root.$us_url_root.'usersc/includes/head_tags.php')){
    $head_tags = get_echo(function(){
        global $abs_us_root, $us_url_root;
        require_once $abs_us_root.$us_url_root.'usersc/includes/head_tags.php';
    });
}

if(($settings->messaging == 1) && ($user->isLoggedIn())){
    $msgQ = $db->query("SELECT id FROM messages WHERE msg_to = ? AND msg_read = 0 AND deleted = 0",array($user->data()->id));
    $msgC = $msgQ->count();
    if($msgC == 1){
        $grammar = 'Message';
    }else{
        $grammar = 'Messages';
    }
}

$nav = get_echo(function(){
    global $abs_us_root, $us_url_root, $settings, $lang, $db, $user, $grammar, $msgC;
    require_once $abs_us_root.$us_url_root.'users/includes/navigation.php';
    require_once $abs_us_root.$us_url_root.'users/includes/about.php';
});

if(isset($_GET['err'])){
    $err = get_echo(err, ["<br>".$err]);
}

if(isset($_GET['msg'])){
    $msg = get_echo(err, ["<br>".$msg]);
}

$default_themes = ['bright.css', 'clean.css', 'dark.css', 'flat.css', 'muted.css', 'standard.css'];
$theme = preg_replace("/^.*\//i", "", $settings->us_css1);

$pg_vars = [
    'is_die' => false,
    'head_tags' => $head_tags,
    'site_name' => $settings->site_name,
    'theme' => in_array($theme, $default_themes) ? $theme : null,
    'err' => $err,
    'msg' => $msg,
    'nav' => $nav,
    'copyright_year' => date('Y'),
    'copyright_message' => html_entity_decode($settings->copyright),
];

$render_view = function ($template, $vars=[]) use ($pg_vars) {
    $payloads = array_merge($pg_vars, $vars);
    $blade = new \Jenssegers\Blade\Blade(__DIR__.'/../templates/views', __DIR__.'/../templates/cache');
    echo $blade->make($template, $payloads);
};

$on_die = function($template) use ($render_view) {
    if (!defined('DIE_NOT_CALLED')) {
        call_user_func_array($render_view, [$template, ['is_die' => true]]);
    }
};
