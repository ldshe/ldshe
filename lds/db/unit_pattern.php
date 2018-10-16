<?php require_once '../init.php'; ?>
<?php require_once '../includes/pattern.php'; ?>
<?php if (!securePage($_SERVER['PHP_SELF'])){die();} ?>
<?php
$errors = array();
$success = array();
$patternCount = 0;
//Forms posted
if(!empty($_POST)) {
    $token = reset($_POST)['pattern_csrf'];
    // if(!LDSToken::check('pattern', $token)) {
    //     die('Token doesn\'t match, expect: '.Config::get('session/token_name_pattern'));
    //     $errors['message'] = 'Token doesn\'t match!';
    // } else {
        $date = date("Y-m-d H:i:s");
        $db = DB::getInstance();
        //echo '<pre>';
        //print_r($_POST);
        //echo '</pre>';
        //exit;

        foreach($_POST as $unitNum => $p) {
            $pattern = array(
                'user_id' => $user->data()->id,
                'name' => $p['name'],
                'modified' => $date
            );
            $courseId = $p['courseId'];
            if (!courseIdExists($courseId)) {
                $errors['message'] = "Course doesn't exist.";
                break;
            }
            $unitId = getUnitId($courseId, $unitNum);

            if ($patternId = getUnitPatternId($unitId)) {
                if (patternIdExists($patternId)) {
                    // pattern exist
                    $patternDetails = fetchPatternDetails($patternId);
                    if ($patternDetails->user_id == $user->data()->id) {
                        // current user is the author = have permission
                        $db->update('ldshe_patterns', $patternId, $pattern);
                        $savePatternId = $patternId;
                        $success['message'] = 'Unit patterns were updated';
                    } else {
                        $errors['message'] = 'You don\'t have permission to edit this pattern!';
                    }
                } else {
                    $errors['message'] = 'Pattern ID doesn\'t exist!';
                }
            } else {
                // new pattern
                $pattern['created'] = $date;
                $db->insert('ldshe_patterns', $pattern);
                $savePatternId = $db->lastId();
                $unitPattern = array(
                    'unit_id' => $unitId,
                    'pattern_id' => $savePatternId
                );
                $db->insert('ldshe_unit_patterns', $unitPattern);
                $success['message'] = 'Unit patterns were created';
            }
            $patternCount++;

            if (isset($savePatternId)) {
                // Insert/update/remove ldshe_pattern_nodes
                if (isset($p['nodes'])) {
                    $nodes = $p['nodes'];
                    $exist_nodes = fetchAllNodes($savePatternId);
                    foreach ($nodes as $key => $value) {
                        $node = array(
                            "pattern_id" => $savePatternId,
                            "clsName" => $value['clsName'],
                            "elementId" => $value['elementId'],
                            "label" => $value['label'],
                            "nodeType" => $value['nodeType'],
                            "subType" => $value['subType'],
                            "positionX" => $value['positionX'],
                            "positionY" => $value['positionY']
                        );

                        if (isset($exist_nodes[$key])) {
                            $db->update('ldshe_pattern_nodes', $exist_nodes[$key]->id, $node);
                            unset($exist_nodes[$key]);
                        } else {
                            $db->insert('ldshe_pattern_nodes', $node);
                        }
                    }
                    if (!empty($exist_nodes)) {
                        foreach ($exist_nodes as $n) {
                            $db->deleteById('ldshe_pattern_nodes', $n->id);
                        }
                    }
                } else {
                    // no node, delete all existing nodes
                    $db->delete('ldshe_pattern_nodes', array('pattern_id','=', $savePatternId));
                }

                // Insert/update/remove ldshe_pattern_connections
                if (isset($p['connections'])) {
                    $connections = $p['connections'];
                    $exist_connections = fetchAllConnections($savePatternId);
                    foreach ($connections as $key => $value) {
                        $connection = array(
                            "pattern_id" => $savePatternId,
                            "connectionId" => $value['connectionId'],
                            "sourceUUId" => $value['sourceUUId'],
                            "targetUUId" => $value['targetUUId']
                        );

                        if (isset($exist_connections[$key])) {
                            $db->update('ldshe_pattern_connections', $exist_connections[$key]->id, $connection);
                            unset($exist_connections[$key]);
                        } else {
                            $db->insert('ldshe_pattern_connections', $connection);
                        }
                    }
                    if (!empty($exist_connections)) {
                        foreach ($exist_connections as $c) {
                            $db->deleteById('ldshe_pattern_connections', $c->id);
                        }
                    }
                } else {
                    // no connection, delete all existing connections
                    $db->delete('ldshe_pattern_connections', array('pattern_id','=', $savePatternId));
                }

                // Insert/update/remove ldshe_pattern_activities
                if (isset($p['activities'])) {
                    $activities = $p['activities'];
                    $exist_activities = fetchAllActivities($savePatternId);
                    $aIndex = 0;
                    foreach ($activities as $key => $value) {
                        $activity = array(
                            "pattern_id" => $savePatternId,
                            "elementId" => $value['elementId'],
                            "type" => $value['type'],
                            "description" => $value['description'],
                            "assessment" => isset($value['assessment'])?$value['assessment']:'',
                            "social" => $value['social'],
                            "duration" => $value['duration'],
                            "setting" => $value['setting'],
                            "notes" => $value['notes']
                        );

                        if (isset($exist_activities[$aIndex])) {
                            $db->update('ldshe_pattern_activities', $exist_activities[$aIndex]->id, $activity);
                            $activity_id = $exist_activities[$aIndex]->id;
                            unset($exist_activities[$aIndex]);

                            $updated_feedback_ids = updateActivitySetting($activity_id, 'feedback', $value);
                            $updated_motivator_ids = updateActivitySetting($activity_id, 'motivator', $value);
                            $updated_resource_ids = updateActivitySetting($activity_id, 'resources', $value);
                            $updated_tool_ids = updateActivitySetting($activity_id, 'tools', $value);
                        } else {
                            $db->insert('ldshe_pattern_activities', $activity);
                            $activity_id = $db->lastId();

                            $updated_feedback_ids = updateActivitySetting($activity_id, 'feedback', $value, true);
                            $updated_motivator_ids = updateActivitySetting($activity_id, 'motivator', $value, true);
                            $updated_resource_ids = updateActivitySetting($activity_id, 'resources', $value, true);
                            $updated_tool_ids = updateActivitySetting($activity_id, 'tools', $value, true);
                        }
                        $aIndex++;
                    }
                    if (!empty($exist_activities)) {
                        foreach ($exist_activities as $c) {
                            $db->deleteById('ldshe_pattern_activities', $c->id);
                        }
                    }
                } else {
                    $exist_activities = fetchAllActivities($savePatternId);
                    // no activity, delete all existing activities
                    $db->delete('ldshe_pattern_activities', array('pattern_id','=', $savePatternId));
                    foreach ($exist_activities as $key => $value) {
                        $db->delete('ldshe_pattern_activity_feedback', array('activity_id','=', $value->id));
                        $db->delete('ldshe_pattern_activity_motivator', array('activity_id','=', $value->id));
                        $db->delete('ldshe_pattern_activity_resources', array('activity_id','=', $value->id));
                        $db->delete('ldshe_pattern_activity_tools', array('activity_id','=', $value->id));
                    }
                }
            }
        }


        if (!empty($success)) {
            $success['type'] = 'success';
            $success['message'] = $patternCount>1 ? $patternCount.' patterns were saved':$patternCount .' pattern was saved';
            echo json_encode($success);
        } else {
            $errors['type'] = 'error';
            echo json_encode($errors);
        }
    // }
} else if (!empty($_GET['get_unit_patterns'])) {
    if ($courseId = Input::get('get_unit_patterns')) {
        if ($patterns = getCoursePatterns($courseId)) {
            echo json_encode($patterns);
        } else {

        }
    } else {
        header("Location: ../../index.php");
    }
}
