<?php
/*
Learning Design Studio (Higher Education)
by Andy Chan (citeandy@hku.hk)
*/
?>
<?php
require_once 'init.php';
require_once $abs_us_root.$us_url_root.'lds/includes/header_designs_list.php';
require_once $abs_us_root.$us_url_root.'users/includes/navigation.php';
require_once $abs_us_root.$us_url_root.'lds/includes/course.php';
?>

<?php if (!securePage($_SERVER['PHP_SELF'])){die();} ?>
<?php
//PHP Goes Here!
$userId = $user->data()->id;
$designs = fetchAllCourses($userId);

$tableHtml = '<table id="designs_list" class="display">';
$tableHtml .= '<thead><tr>';
$tableHtml .= '<th>Title</th>';
$tableHtml .= '<th>Subject</th>';
$tableHtml .= '<th>Teacher/Instructor</th>';
$tableHtml .= '<th>Class Size</th>';
$tableHtml .= '<th>No. of sessions</th>';
$tableHtml .= '<th>Actions</th>';
$tableHtml .= '</tr></thead>';
$tableHtml .= '<tbody>';
foreach ($designs as $dKey => $fields) {
    $editBtn = '<a href="design_edit.php?id='.$fields->id.'" class="btn btn-default btn-sm" title="Edit">';
    $editBtn .= '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>';
    $editBtn .= '</a>';
    $copyBtn = '<a data-id="'.$fields->id.'" class="btn btn-default btn-sm designCopyBtn" title="Copy">';
    $copyBtn .= '<span class="glyphicon glyphicon-duplicate" aria-hidden="true"></span>';
    $copyBtn .= '</a>';
    $delBtn = '<a data-id="'.$fields->id.'" class="btn btn-default btn-sm designDelBtn" title="Delete">';
    $delBtn .= '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
    $delBtn .= '</a>';

    $tableHtml .= '<tr>';
    $tableHtml .= '<td><a href="design_edit.php?id='.$fields->id.'">'.$fields->title.'</a></td>';
    $tableHtml .= '<td>'.$fields->subject.'</td>';
    $tableHtml .= '<td>'.$fields->teacher.'</td>';
    $tableHtml .= '<td>'.$fields->class_size.'</td>';
    $tableHtml .= '<td>'.$fields->session_num.'</td>';
    $tableHtml .= '<td><div class="btn-group">'.$editBtn.$copyBtn.$delBtn.'</div></td>';
    $tableHtml .= '</tr>';
}
$tableHtml .= '</tbody>';
$tableHtml .= '</table>';
?>
<div class="container">
    <h2>My Designs</h2>
    <div class="row">
        <div id="design-list-btn" class="col-md-12">
            <a href="design_edit.php" class="btn btn-primary" title="">
                <span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add New Design
            </a>
        </div>
        <div id="designs-list-container" class="col-md-12">
            <?php echo $tableHtml; ?>
        </div>
    </div>
</div>
<!-- footers -->
<?php require_once $abs_us_root.$us_url_root.'users/includes/page_footer.php'; // the final html footer copyright row + the external js calls ?>

<!-- Place any per-page javascript here -->
<script src="js/underscore-min.js"></script>
<script src="js/alertify.js"></script>
<script src="//cdn.datatables.net/1.10.15/js/jquery.dataTables.min.js"></script>
<script src="js/designs_list.js"></script>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; // currently just the closing /body and /html ?>
