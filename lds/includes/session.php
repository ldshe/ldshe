<?php
function courseIdExists($id) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_courses WHERE id = ?", array($id));
	$num_returns = $query->count();
	if ($num_returns > 0){
		return true;
	}else{
		return false;
	}
}

function getSessionId($course_id, $ordering) {
    $db = DB::getInstance();
    $query = $db->query("SELECT id FROM ldshe_sessions WHERE course_id = $courseId AND ordering = $ordering LIMIT 1");
	if ($results = $query->first()) {
		if ($results->id) {
			return ($results->id);
		} else {
			return false;
		}
	}
}

function fetchAllSessions($course_id) {
    $db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_sessions WHERE course_id = $course_id ORDER BY ordering ASC");
	$results = $query->results();
	return ($results);
}

function fetchAllAllocations($course_id, $mode='') {
    $db = DB::getInstance();
    if ($mode == '') {
        $mode_where = '';
    } else {
        $mode_where = " AND mode = '$mode'";
    }
	$query = $db->query("SELECT * FROM ldshe_session_allocations WHERE course_id = ".$course_id.$mode_where);
	$results = $query->results();
	return ($results);
}

function unitAllocationExist($course_id, $session, $unit, $ordering) {
    $db = DB::getInstance();
	$query = $db->query(
        "SELECT * FROM ldshe_session_allocations WHERE course_id = ? AND mode = 'full' AND ordering = ? AND session = ? AND unit = ?",
        array($course_id, $ordering, $session, $unit)
    );
	$num_returns = $query->count();
	if ($num_returns > 0){
		return true;
	}else{
		return false;
	}
}

?>
