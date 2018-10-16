<?php require_once '../init.php'; ?>
<?php require_once '../includes/pattern.php'; ?>
<?php if (!securePage($_SERVER['PHP_SELF'])){die();} ?>
<?php
$errors = array();
$success = array();
//Forms posted
if(!empty($_POST)) {
    $token = $_POST['pattern_csrf'];
    // if(!LDSToken::check('pattern', $token)) {
    //     die('Token doesn\'t match, expect: '.Config::get('session/token_name_pattern'));
    //     $errors['message'] = 'Token doesn\'t match!';
    // } else {
        $date = date("Y-m-d H:i:s");

        // Insert/update ldshe_patterns
        $pattern = array(
            'user_id' => $user->data()->id,
            'name' => Input::get('name'),
            'modified' => $date
        );

        $db = DB::getInstance();
        if($patternId = Input::get('id')) {
            if(patternIdExists($patternId)) {
                // pattern exist
                $patternDetails = fetchPatternDetails($patternId);
                if ($patternDetails->user_id == $user->data()->id) {
                    // current user is the author = have permission
                    $db->update('ldshe_patterns', $patternId, $pattern);
                    $success['message'] = 'Pattern setting updated.';
                    $success['id'] = $patternId;
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
            $success['message'] = 'Pattern created.';
            $success['id'] = $db->lastId();
        }

        if (isset($success['id'])) {
            // Insert/update/remove ldshe_pattern_nodes
            $success['node_ids'] = array();
            if (isset($_POST['nodes'])) {
                $nodes = $_POST['nodes'];
                $exist_nodes = fetchAllNodes($success['id']);
                foreach ($nodes as $key => $value) {
                    $node = array(
                        "pattern_id" => $success['id'],
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
                        $success['node_ids'][] = $exist_nodes[$key]->id;
                        unset($exist_nodes[$key]);
                    } else {
                        $db->insert('ldshe_pattern_nodes', $node);
                        $success['node_ids'][] = $db->lastId();
                    }
                }
                if (!empty($exist_nodes)) {
                    foreach ($exist_nodes as $n) {
                        $db->deleteById('ldshe_pattern_nodes', $n->id);
                    }
                }
            } else {
                // no node, delete all existing nodes
                $db->delete('ldshe_pattern_nodes', array('pattern_id','=', $success['id']));
            }

            // Insert/update/remove ldshe_pattern_connections
            $success['connection_ids'] = array();
            if (isset($_POST['connections'])) {
                $connections = $_POST['connections'];
                $exist_connections = fetchAllConnections($success['id']);
                foreach ($connections as $key => $value) {
                    $connection = array(
                        "pattern_id" => $success['id'],
                        "connectionId" => $value['connectionId'],
                        "sourceUUId" => $value['sourceUUId'],
                        "targetUUId" => $value['targetUUId']
                    );

                    if (isset($exist_connections[$key])) {
                        $db->update('ldshe_pattern_connections', $exist_connections[$key]->id, $connection);
                        $success['connection_ids'][] = $exist_connections[$key]->id;
                        unset($exist_connections[$key]);
                    } else {
                        $db->insert('ldshe_pattern_connections', $connection);
                        $success['connection_ids'][] = $db->lastId();
                    }
                }
                if (!empty($exist_connections)) {
                    foreach ($exist_connections as $c) {
                        $db->deleteById('ldshe_pattern_connections', $success['id']);
                    }
                }
            } else {
                // no connection, delete all existing connections
                $db->delete('ldshe_pattern_connections', array('pattern_id','=', $success['id']));
            }

            // Insert/update/remove ldshe_pattern_activities
            $success['activity_ids'] = array();
            if (isset($_POST['activities'])) {
                $activities = $_POST['activities'];
                $exist_activities = fetchAllActivities($success['id']);
                $aIndex = 0;
                foreach ($activities as $key => $value) {
                    $activity = array(
                        "pattern_id" => $success['id'],
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
                    $success['activity_ids'][] = $activity_id;
                    $aIndex++;
                }
                if (!empty($exist_activities)) {
                    foreach ($exist_activities as $c) {
                        $db->deleteById('ldshe_pattern_activities', $c->id);
                    }
                }
            } else {
                $exist_activities = fetchAllActivities($success['id']);
                // no activity, delete all existing activities
                $db->delete('ldshe_pattern_activities', array('pattern_id','=', $success['id']));
                foreach ($exist_activities as $key => $value) {
                    $db->delete('ldshe_pattern_activity_feedback', array('activity_id','=', $value->id));
                    $db->delete('ldshe_pattern_activity_motivator', array('activity_id','=', $value->id));
                    $db->delete('ldshe_pattern_activity_resources', array('activity_id','=', $value->id));
                    $db->delete('ldshe_pattern_activity_tools', array('activity_id','=', $value->id));
                }
            }
        }
        if (!empty($success)) {
            $success['type'] = 'success';
            echo json_encode($success);
        } else {
            $errors['type'] = 'error';
            echo json_encode($errors);
        }
    // }
} else if (!empty($_GET['get_pattern'])) {
    if ($get_pattern = Input::get('get_pattern')) {
        if (patternIdExists($get_pattern)) {
            $pattern = fetchPatternDetails($get_pattern);
            $nodes = fetchAllNodes($pattern->id);
            $connections = fetchAllConnections($pattern->id);
            $activities = fetchAllActivities($pattern->id);

            $full_activities = [];
            foreach ($activities as $a) {
                $full_activity = (object) $a;
                $full_activity->feedback = array_map(function($a){return $a->type;}, fetchAllActivitySubItems($a->id, 'feedback'));
                $full_activity->motivator = array_map(function($a){return $a->type;}, fetchAllActivitySubItems($a->id, 'motivator'));
                $full_activity->resources = array_map(function($a){return $a->type;}, fetchAllActivitySubItems($a->id, 'resources'));
                $full_activity->tools = array_map(function($a){return $a->type;}, fetchAllActivitySubItems($a->id, 'tools'));
                $full_activities[$a->elementId] = $full_activity;
            }

            $returnObj = (object) [
                'name' => $pattern->name,
                'nodes' => $nodes,
                'connections' => $connections,
                'activities' => $full_activities
            ];
            echo json_encode($returnObj);
        } else {
            $errors['message'] = 'Pattern doesn\'t exist!';
        }
    } else {
        header("Location: ../../index.php");
    }
} else if (!empty($_GET['get_all_patterns'])) {
    if ($get_all_patterns = Input::get('get_all_patterns')) {
        $patterns = fetchAllPatterns($user->data()->id);
        $json = '{"data":[';
        foreach ($patterns as $i => $p) {
            $activities = fetchAllActivities($p->id);
            $json .= '[';
            $json .= '"'.$p->name.'",';
            $json .= '"'.count($activities).'",';
            $json .= '"'.$p->created.'",';
            $json .= '"'.$p->modified.'",';
            $json .= '"'.$p->id.'"';
            $json .= ']';
            if (($i+1) != count($patterns)) $json .= ',';
        }
        $json .= ']}';
        echo $json;
    } else {
        header("Location: ../../index.php");
    }
} else if (!empty($_GET['get_all_patterns_select'])) {
    if ($get_all_patterns_select = Input::get('get_all_patterns_select')) {
        $patterns = fetchAllPatterns($user->data()->id);
        $json = '{"patterns":[';
        foreach ($patterns as $i => $p) {
            $related_courses = [];
            if ($courses = getPatternCourses($p->id)) {
                foreach ($courses as $key => $c) {
                    $related_courses[] = '[Unit '.$c->unit.'] '.$c->title;
                }
                $related_courses = implode('<br>', $related_courses);
            } else {
                $related_courses = 'N/A';
            }
            $json .= '{';
            $json .= '"id": '.$p->id.',';
            $json .= '"name": "'.$p->name.'",';
            $json .= '"related": "'.$related_courses.'"';
            $json .= '}';
            if (($i+1) != count($patterns)) $json .= ',';
        }
        $json .= ']}';
        echo $json;
    } else {
        header("Location: ../../index.php");
    }
} else if (!empty($_GET['delete_pattern'])) {
    if ($patternId = Input::get('delete_pattern')) {
        if(patternIdExists($patternId)) {
            $patternDetails = fetchPatternDetails($patternId);
            if ($patternDetails->user_id == $user->data()->id) {
                if (!unitPatternExist($patternId)) {
                    $db = DB::getInstance();
                    $db->delete('ldshe_pattern_nodes', array('pattern_id','=',$patternId));
                    $db->delete('ldshe_pattern_connections', array('pattern_id','=',$patternId));
                    $activities = fetchAllActivities($patternId);
                    foreach ($activities as $a) {
                        $db->delete('ldshe_pattern_activity_feedback', array('activity_id','=', $a->id));
                        $db->delete('ldshe_pattern_activity_motivator', array('activity_id','=', $a->id));
                        $db->delete('ldshe_pattern_activity_resources', array('activity_id','=', $a->id));
                        $db->delete('ldshe_pattern_activity_tools', array('activity_id','=', $a->id));
                        $db->deleteById('ldshe_pattern_activities', $a->id);
                    }
                    $db->deleteById('ldshe_patterns', $patternId);
                    $success['message'] = $patternDetails->name.' is deleted';
                } else {
                    $errors['message'] = "Pattern is associated with a course unit and cannot be deleted";
                }

            } else {
                $errors['message'] = "No permission to delete";
            }
        } else {
            $errors['message'] = "Pattern doesn't exist";
        }
        if (!empty($success)) {
            $success['type'] = 'success';
            echo json_encode($success);
        } else {
            $errors['type'] = 'error';
            echo json_encode($errors);
        }
    } else {
        header("Location: ../../index.php");
    }
} else if (!empty($_GET['copy_pattern'])) {
    if ($patternId = Input::get('copy_pattern')) {
        if(patternIdExists($patternId)) {
            $patternDetails = fetchPatternDetails($patternId);
            if ($patternDetails->user_id == $user->data()->id) {
                copyPattern($patternId);
                $success['message'] = $patternDetails->name.' is copied';
            } else {
                $errors['message'] = "No permission to copy";
            }
        } else {
            $errors['message'] = "Pattern doesn't exist";
        }
        if (!empty($success)) {
            $success['type'] = 'success';
            echo json_encode($success);
        } else {
            $errors['type'] = 'error';
            echo json_encode($errors);
        }
    } else {
        header("Location: ../../index.php");
    }
}
