<?php
/*
Learning Design Studio (Higher Education)
by Andy Chan (citeandy@hku.hk)
*/
?>
<?php
require_once 'init.php';
require_once $abs_us_root.$us_url_root.'lds/includes/header_patterns_list.php';
require_once $abs_us_root.$us_url_root.'users/includes/navigation.php';
require_once $abs_us_root.$us_url_root.'lds/includes/pattern.php';
?>

<?php if (!securePage($_SERVER['PHP_SELF'])){die();} ?>
<?php
//PHP Goes Here!
$userId = $user->data()->id;
$patterns = fetchAllPatterns($userId);

$tableHtml = '<table id="patterns_list" class="display">';
$tableHtml .= '<thead><tr>';
$tableHtml .= '<th>Name</th>';
$tableHtml .= '<th>No. of activities</th>';
//$tableHtml .= '<th>Time created</th>';
$tableHtml .= '<th>Related Design(s)</th>';
$tableHtml .= '<th>Time modified</th>';
$tableHtml .= '<th>Actions</th>';
$tableHtml .= '</tr></thead>';
$tableHtml .= '<tbody>';
foreach ($patterns as $pKey => $p) {
    $nodes = fetchAllNodes($p->id);
    $connections = fetchAllConnections($p->id);
    if ($courses = getPatternCourses($p->id)) {
        $related_courses = [];
        foreach ($courses as $key => $c) {
            $related_courses[] = '<a href="design_edit.php?id='.$c->id.'">[Unit '.$c->unit.'] '.$c->title.'</a>';
        }
        $related_courses = implode('<br>', $related_courses);
    } else {
        $related_courses = 'N/A';
    }

    $editBtn = '<a href="pattern_edit.php?id='.$p->id.'" class="btn btn-default btn-sm" title="Edit">';
    $editBtn .= '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>';
    $editBtn .= '</a>';
    $copyBtn = '<a data-id="'.$p->id.'" class="btn btn-default btn-sm patternCopyBtn" title="Copy">';
    $copyBtn .= '<span class="glyphicon glyphicon-duplicate" aria-hidden="true"></span>';
    $copyBtn .= '</a>';
    $delBtn = '<a data-id="'.$p->id.'" class="btn btn-default btn-sm patternDelBtn" title="Delete">';
    $delBtn .= '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
    $delBtn .= '</a>';

    $pattern_name = trim($p->name) ? $p->name:'<i class="fa fa-exclamation-circle" aria-hidden="true"></i> <i>Untitled</i>';
    $tableHtml .= '<tr>';
    $tableHtml .= '<td><a href="pattern_edit.php?id='.$p->id.'">'.$pattern_name.'</a></td>';
    $tableHtml .= '<td>'.count($nodes).'</td>';
    $tableHtml .= '<td>'.$related_courses.'</td>';
    $tableHtml .= '<td>'.$p->modified.'</td>';
    $tableHtml .= '<td><div class="btn-group">'.$editBtn.$copyBtn.$delBtn.'</div></td>';
    $tableHtml .= '</tr>';
}
$tableHtml .= '</tbody>';
$tableHtml .= '</table>';
?>
<div class="container">
    <h2>My Patterns</h2>
    <div class="row">
        <div id="pattern-list-btn" class="col-md-12">
            <a href="pattern_edit.php" class="btn btn-primary" title="">
                <span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add New Pattern
            </a>
        </div>
        <div id="patterns-list-container" class="col-md-12">
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
<script src="js/patterns_list.js"></script>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; // currently just the closing /body and /html ?>
