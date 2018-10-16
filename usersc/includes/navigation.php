<div class="collapse navbar-collapse navbar-top-menu-collapse navbar-left"> <!-- Left navigation items -->
	<ul class="nav navbar-nav ">
		<!--<li><a href="<?=$us_url_root?>"><i class="fa fa-home"></i> Home</a></li>-->
		<?php if($user->isLoggedIn()) { ?>
		<li>
			<div class="btn-group navbar-btn">
				<a class="btn" href="<?=$us_url_root?>ldsv2/design.php#/my">
					<i class="fa fa-list"></i> My Designs
				</a>
				<button data-toggle="dropdown" class="btn dropdown-toggle"><span class="caret"></span></button>
				<ul class="dropdown-menu dropdown-menu-right">
					<li><a class="dropdown-item" href="<?=$us_url_root?>ldsv2/design.php#/create"><i class="fa fa-plus"></i> New Design</a></li>
				</ul>
				<div class="background"></div>
			</div>
		</li>
		<li>
			<div class="btn-group navbar-btn">
				<?php if (checkMenu2('Curator', $user->data()->id)) { ?>
				<a class="btn" href="<?=$us_url_root?>ldsv2/design.php#/curated"><i class="fa fa-university"></i> Public Designs</a>
				<?php } else {?>
				<a class="btn" href="<?=$us_url_root?>ldsv2/design.php#/public"><i class="fa fa-university"></i> Public Designs</a>
				<?php }?>
				<button data-toggle="dropdown" class="btn dropdown-toggle"><span class="caret"></span></button>
				<ul class="dropdown-menu dropdown-menu-right">
					<li><a href="<?=$us_url_root?>ldsv2/design.php#/shared"><i class="fa fa-users"></i> Shared Designs</a></li>
				</ul>
				<div class="background"></div>
			</div>
		</li>
		<li class="dropdown">
			<a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
				<i class="fa fa-object-group"></i> Pattern Library <span class="caret"></span>
			</a>
			<ul class="dropdown-menu dropdown-menu-right">
				<li><a href="<?=$us_url_root?>ldsv2/design.php#/pattern/my"><i class="fa fa-list"></i> My Patterns</a></li>
				<?php if (checkMenu2('Curator', $user->data()->id)) { ?>
				<li><a href="<?=$us_url_root?>ldsv2/design.php#/pattern/curated"><i class="fa fa-university"></i> Public Patterns</a></li>
				<?php } else {?>
				<li><a href="<?=$us_url_root?>ldsv2/design.php#/pattern/public"><i class="fa fa-university"></i> Public Patterns</a></li>
				<?php }?>
				<li><a href="<?=$us_url_root?>ldsv2/design.php#/pattern/shared"><i class="fa fa-users"></i> Shared Patterns</a></li>
			</ul>
		</li>
		<li class="hidden-sm hidden-md hidden-lg"><a href="#/group"><i class="fa fa-fw fa-users"></i> My Groups</a></li>
		<?php if (checkMenu2('Curator', $user->data()->id)) { ?>
		<li class="dropdown">
			<a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
				<i class="fa fa-share-square"></i> Contributions <span class="caret"></span>
			</a>
			<ul class="dropdown-menu dropdown-menu-right">
				<li><a href="<?=$us_url_root?>ldsv2/design.php#/contributed"><i class="fa fa-fw fa-paint-brush"></i> Contributed Designs</a></li>
				<li><a href="<?=$us_url_root?>ldsv2/design.php#/pattern/contributed"><i class="fa fa-fw fa-object-group"></i> Contributed Patterns</a></li>
			</ul>
		</li>
		<?php }?>

		<?php } ?>

	</ul>
</div>
