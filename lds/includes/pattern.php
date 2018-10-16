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

// Check if a pattern ID exists in the DB
function patternIdExists($id) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_patterns WHERE id = ?", array($id));
	$num_returns = $query->count();
	if ($num_returns > 0){
		return true;
	} else {
		return false;
	}
}

// Retrieve complete pattern information by course ID
function fetchPatternDetails($id=NULL) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_patterns WHERE id = $id LIMIT 1");
	if ($query->count() > 0) {
		if ($results = $query->first()) {
			return ($results);
		} else {
			return false;
		}
	}  else {
		return false;
	}

}

// Retrieve all patterns for a given user
function fetchAllPatterns($userId) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_patterns WHERE user_id = $userId ORDER BY id DESC");
	$results = $query->results();
	return ($results);
}

// Retrieve all nodes for a given pattern
function fetchAllNodes($pattern_id) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_pattern_nodes WHERE pattern_id = ? ORDER BY id ASC", array($pattern_id));
    $results = $query->results();
	return ($results);
}

// Retrieve all connections for a given pattern
function fetchAllConnections($pattern_id) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_pattern_connections WHERE pattern_id = ? ORDER BY id ASC", array($pattern_id));
    $results = $query->results();
	return ($results);
}

function fetchAllActivities($pattern_id) {
    $db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_pattern_activities WHERE pattern_id = ? ORDER BY id ASC", array($pattern_id));
    $results = $query->results();
	return ($results);
}

function fetchAllActivitySubItems($activity_id, $table) {
    $db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_pattern_activity_".$table." WHERE activity_id = ? ORDER BY id ASC", array($activity_id));
    $results = $query->results();
	return ($results);
}

// insert/update/delete sub-detail of activity
function updateActivitySetting($activity_id, $type, $data, $insert_only=false) {
    $return = [];
    $exist = [];
    if (!$insert_only) $exist = fetchAllActivitySubItems($activity_id, $type);
    if (!empty($data[$type])) {
        $db = DB::getInstance();
        foreach ($data[$type] as $k => $v) {
            $detail = array(
                "activity_id" => $activity_id,
                "type" => $v,
                "title" => '',
                "description" => ''
            );
            if (isset($exist[$k])) {
                $db->update('ldshe_pattern_activity_'.$type, $exist[$k]->id, $detail);
                $return[] = $exist[$k]->id;
                unset($exist[$k]);
            } else {
                $db->insert('ldshe_pattern_activity_'.$type, $detail);
                $return[] = $db->lastId();
            }
        }
        if (!empty($exist)) {
            foreach ($exist as $v) {
                $db->deleteById('ldshe_pattern_activity_'.$type, $v->id);
            }
        }
    }
    return $return;
}

// Create an empty pattern object
function newPattern() {
    $pattern = new stdClass();
    $pattern->id = "";
    $pattern->name = "";
    return $pattern;
}

// Copy a pattern
function copyPattern($pattern_id) {
	if(patternIdExists($pattern_id)) {
		$pattern = fetchPatternDetails($pattern_id);
		$patternArr = (array) $pattern;

		$all_nodes = fetchAllNodes($pattern_id);
		$all_connections = fetchAllConnections($pattern_id);
        $all_activities = fetchAllActivities($pattern_id);

		$date = date("Y-m-d H:i:s");
		$db = DB::getInstance();

		unset($patternArr['id']);
		$patternArr['created'] = $date;
		$patternArr['modified'] = $date;
		$db->insert('ldshe_patterns', $patternArr);
		$new_pattern_id = $db->lastId();

		foreach($all_nodes as $node) {
			$nodeArr = (array) $node;
			unset($nodeArr['id']);
			$nodeArr['pattern_id'] = $new_pattern_id;
			$db->insert('ldshe_pattern_nodes', $nodeArr);
		}

		foreach($all_connections as $conn) {
			$connArr = (array) $conn;
			unset($connArr['id']);
			$connArr['pattern_id'] = $new_pattern_id;
			$db->insert('ldshe_pattern_connections', $connArr);
		}

        foreach($all_activities as $activity) {
            $activityArr = (array) $activity;
            $feedback = fetchAllActivitySubItems($activityArr['id'], 'feedback');
            $motivator = fetchAllActivitySubItems($activityArr['id'], 'motivator');
            $resources = fetchAllActivitySubItems($activityArr['id'], 'resources');
            $tools = fetchAllActivitySubItems($activityArr['id'], 'tools');

			unset($activityArr['id']);
			$activityArr['pattern_id'] = $new_pattern_id;
			$db->insert('ldshe_pattern_activities', $activityArr);
            $activity_id = $db->lastId();

            foreach ($feedback as $f) {
                $fArr = (array) $f;
                unset($fArr['id']);
                $fArr['activity_id'] = $activity_id;
                $db->insert('ldshe_pattern_activity_feedback', $fArr);
            }
            foreach ($motivator as $m) {
                $mArr = (array) $m;
                unset($mArr['id']);
                $mArr['activity_id'] = $activity_id;
                $db->insert('ldshe_pattern_activity_motivator', $mArr);
            }
            foreach ($resources as $r) {
                $rArr = (array) $r;
                unset($rArr['id']);
                $rArr['activity_id'] = $activity_id;
                $db->insert('ldshe_pattern_activity_resources', $rArr);
            }
            foreach ($tools as $t) {
                $tArr = (array) $t;
                unset($tArr['id']);
                $tArr['activity_id'] = $activity_id;
                $db->insert('ldshe_pattern_activity_tools', $tArr);
            }
		}
	}
}

function getUnitId($courseId, $order) {
	$db = DB::getInstance();
	$query = $db->query("SELECT id FROM ldshe_units WHERE course_id = $courseId AND ordering = $order LIMIT 1");
	if ($query->count() > 0) {
		if ($results = $query->first()) {
			if ($results->id) {
				return ($results->id);
			} else {
				return false;
			}
		}
	} else {
		return false;
	}
}

function getUnitPatternId($unitId) {
	$db = DB::getInstance();
	$query = $db->query("SELECT pattern_id FROM ldshe_unit_patterns WHERE unit_id = $unitId LIMIT 1");
	if ($query->count() > 0) {
		if ($results = $query->first()) {
			if ($results->pattern_id) {
				return ($results->pattern_id);
			} else {
				return false;
			}
		}
	} else {
		return false;
	}
}

function getPatternCourses($patternId) {
	$db = DB::getInstance();
	$query = $db->query("SELECT c.id, c.title, u.id AS unit_id, u.ordering AS unit, u.title AS unit_title
		FROM ((ldshe_courses c INNER JOIN ldshe_units u ON c.id = u.course_id)
		INNER JOIN ldshe_unit_patterns up ON u.id = up.unit_id)
		WHERE up.pattern_id = ".$patternId
	);
	if ($query->count() > 0) {
		$results = $query->results();
	} else {
		return false;
	}
	return ($results);
}


function unitPatternExist($patternId) {
	$db = DB::getInstance();
	$query = $db->query("SELECT * FROM ldshe_unit_patterns WHERE pattern_id = ?", array($patternId));
	$num_returns = $query->count();
	if ($num_returns > 0){
		return true;
	} else {
		return false;
	}
}

function getCoursePatterns($courseId) {
	$db = DB::getInstance();
	$query = $db->query("SELECT lu.ordering, lup.pattern_id FROM ldshe_unit_patterns lup INNER JOIN ldshe_units lu ON lup.unit_id = lu.id WHERE lu.course_id = $courseId");
	if (!$query->results()) {
		return false;
	}
	$patternIds = array();
	foreach ($query->results() as $p) {
		$patternIds[$p->ordering] = $p->pattern_id;
	}
	//$patternIds = array_column($query->results(), 'pattern_id', 'ordering');
	$patterns = array();
	if (!empty($patternIds)) {
		$query = $db->query("SELECT * FROM ldshe_patterns WHERE id IN (".implode(",", $patternIds).")");
		$patterns = array_combine(array_keys($patternIds), $query->results());
		$full_patterns = [];
		foreach ($patterns as $unitNum => $p) {
			$nodes = fetchAllNodes($p->id);
			$connections = fetchAllConnections($p->id);
			$activities = fetchAllActivities($p->id);

			$full_activities = [];
			$full_activities_detail = [];
			foreach($activities as $a) {
				$full_activity_detail = new stdClass();
				$full_activity_detail->feedback = fetchAllActivitySubItems($a->id, 'feedback');
                $full_activity_detail->motivator = fetchAllActivitySubItems($a->id, 'motivator');
                $full_activity_detail->resources = fetchAllActivitySubItems($a->id, 'resources');
                $full_activity_detail->tools = fetchAllActivitySubItems($a->id, 'tools');

				$full_activity = (object) $a;
                $full_activity->feedback = array_map(function($a){return $a->type;}, $full_activity_detail->feedback);
                $full_activity->motivator = array_map(function($a){return $a->type;},$full_activity_detail->motivator);
                $full_activity->resources = array_map(function($a){return $a->type;},$full_activity_detail->resources);
                $full_activity->tools = array_map(function($a){return $a->type;}, $full_activity_detail->tools);

				$full_activities[$a->elementId] = $full_activity;
				$full_activities_detail[$a->elementId] = $full_activity_detail;
			}
			$p->activities = $full_activities;

			$full_pattern = (object) [
				'id' => $p->id,
                'name' => $p->name,
                'nodes' => $nodes,
                'connections' => $connections,
                'activities' => empty($full_activities) ? new stdClass : $full_activities,
				'activities_detail' => $full_activities_detail,
				'courseId' => $courseId
            ];
			$full_patterns[$unitNum] = $full_pattern;
		}
	}
	return ($full_patterns);
}
