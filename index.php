<?php

if(file_exists("install/index.php")){
	//perform redirect if installer files exist
	//this if{} block may be deleted once installed
	header("Location: install/index.php");
}

require_once 'users/init.php';
require_once $abs_us_root.$us_url_root.'users/includes/header.php';
require_once $abs_us_root.$us_url_root.'users/includes/navigation.php';
require_once $abs_us_root.$us_url_root.'users/includes/about.php';
if(isset($user) && $user->isLoggedIn()){
}
?>

<div id="page-wrapper">
<div class="container">
<?php if($user->isLoggedIn()) {?>
<div class="row">
	<div class="col-xs-12">
		<h1>Welcome to <?php echo $settings->site_name;?></h1>
		<p class="text-muted">A tool to support teaching professionals in the design and implementation of fully online and blended courses.</p>
		<p class="pull-right"><a class="btn btn-default" href="users/account.php" role="button">User Account &raquo;</a></p>
	</div>
</div>
<div id="front"></div>
<?php } else {?>
<div class="row">
	<div class="col-xs-12">
		<div class="jumbotron">
			<h1>Welcome to <?php echo $settings->site_name;?></h1>
			<p class="text-muted">A tool to support teaching professionals in the design and implementation of fully online and blended courses.</p>
			<p>
				<a class="btn btn-warning" href="users/login.php" role="button">Log In &raquo;</a>
				<a class="btn btn-info" href="users/join.php" role="button">Sign Up &raquo;</a>
			</p>
		</div>
	</div>
</div>
<?php }?>

</div> <!-- /container -->

</div> <!-- /#page-wrapper -->

<!-- footers -->
<?php require_once $abs_us_root.$us_url_root.'users/includes/page_footer.php'; // the final html footer copyright row + the external js calls ?>

<!-- Place any per-page javascript here -->
<?php if($user->isLoggedIn()) {?>
<?php require_once $abs_us_root.$us_url_root.'ldsv2/helpers/helpers.php'; ?>
<script src="<?php echo mix('js/manifest.js',  __DIR__.'/ldsv2')?>"></script>
<script src="<?php echo mix('js/vendor.js',  __DIR__.'/ldsv2')?>"></script>
<script src="<?php echo mix('js/front.js',  __DIR__.'/ldsv2')?>"></script>
<?php }?>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; // currently just the closing /body and /html ?>
