<?php
// Check if a course ID exists in the DB
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

// Retrieve complete course information by course ID
function fetchCourseDetails($id=NULL){
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_courses WHERE id = $id LIMIT 1");
	$results = $query->first();
	return ($results);
}

// Retrieve all courses (aka designs) for a given user
function fetchAllCourses($userId) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_courses WHERE user_id = $userId ORDER BY id DESC");
	$results = $query->results();
	return ($results);
}

// Create an empty course objective
function newCourse() {
    $course = new stdClass();
    $course->id = "";
    $course->title = "";
    $course->subject = "";
    $course->teacher = "";
    $course->class_size = 10;
    $course->session_num = 1;
    $course->mode = "blended";
    $course->teach_time = "";
    $course->self_time = "";
    $course->type = "core";
    $course->prerequisites = "";
    $course->unit_num = 1;

    return $course;
}

// Check if a course outcome (at a certain position) exists in the DB
function outcomePositionExist($course_id, $ordering) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_outcomes WHERE course_id = ? AND ordering = ?", array($course_id, $ordering));
	$num_returns = $query->count();
	if ($num_returns > 0) {
		return true;
	} else {
		return false;
	}
}

// Retrieve all course outcomes
function fetchCourseOutcomes($course_id) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_outcomes WHERE course_id = $course_id ORDER BY ordering");
	$results = $query->results();
	return ($results);
}

// Retrieve complete course outcome information
function fetchOutcomeDetails($course_id, $ordering) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_outcomes WHERE course_id = $course_id AND ordering = $ordering LIMIT 1");
	$results = $query->first();
	return ($results);
}

// Check if a unit (at a certain position) exists in the DB
function unitPositionExist($course_id, $ordering) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_units WHERE course_id = ? AND ordering = ?", array($course_id, $ordering));
	$num_returns = $query->count();
	if ($num_returns > 0) {
		return true;
	} else {
		return false;
	}
}

// Retrieve all units
function fetchUnits($course_id) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_units WHERE course_id = $course_id ORDER BY ordering");
	$results = $query->results();
	return ($results);
}

// Retrieve all sessions
function fetchAllSessions($course_id) {
    $db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_sessions WHERE course_id = $course_id");
	$results = $query->results();
	return ($results);
}

// Retrieve complete course unit information
function fetchUnitDetails($course_id, $ordering) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_units WHERE course_id = $course_id AND ordering = $ordering LIMIT 1");
	$results = $query->first();
	return ($results);
}

// Copy a design (course)
function copyCourse($course_id) {
	if(courseIdExists($course_id)) {
		$course = fetchCourseDetails($course_id);
		$courseArr = (array) $course;

		$all_outcomes = fetchCourseOutcomes($course_id);
		$all_units = fetchUnits($course_id);

		$date = date("Y-m-d H:i:s");
		$db = DB::getInstance();

		unset($courseArr['id']);
		$courseArr['created'] = $date;
		$courseArr['modified'] = $date;
		$db->insert('ldshe_courses', $courseArr);
		$new_course_id = $db->lastId();

		foreach($all_outcomes as $outcome) {
			$outcomeArr = (array) $outcome;
			unset($outcomeArr['id']);
			$outcomeArr['course_id'] = $new_course_id;
			$db->insert('ldshe_outcomes', $outcomeArr);
		}

		foreach($all_units as $unit) {
			$unitArr = (array) $unit;
			unset($unitArr['id']);
			$unitArr['course_id'] = $new_course_id;
			$db->insert('ldshe_units', $unitArr);
		}
	}
}

// Retrieve all patterns
function fetchAllPatterns($userId) {
    $db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_patterns WHERE user_id = $userId ORDER BY name ASC");
	$results = $query->results();
	return ($results);
}
