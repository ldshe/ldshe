<?php require_once '../init.php'; ?>
<?php require_once '../includes/session.php'; ?>
<?php if (!securePage($_SERVER['PHP_SELF'])){die();} ?>
<?php
$errors = array();
$success = array();

//Forms posted
if(!empty($_POST)) {
    //$token =  Input::get('session_csrf');
    //if(!LDSToken::check('session', $token)) {
        //die('Token doesn\'t match, expect: '.Config::get('session/token_name_session'));
        //$errors['message'] = 'Token doesn\'t match!';
    //} else {
        $db = DB::getInstance();
        $course_id = Input::get('course_id');

        if (courseIdExists($course_id)) {
            // Handle sessions detail
            $existSessions = fetchAllSessions($course_id);
            if (isset($_POST['sessions'])) {
                foreach($_POST['sessions'] as $k => $title) {
                    $session = array(
                        'course_id' => $course_id,
                        'user_id' => $user->data()->id,
                        'ordering' => $k+1,
                        'title' => $title,
                        'description' => ''
                    );
                    $checkSession = array_filter($existSessions, function($v) use ($k) {
                        return $v->ordering==$k+1;
                    });
                    if (!empty($checkSession)) {
                        $sessionId = $checkSession[$k]->id;
                        $sessionDetails = array_pop($checkSession);
                        if ($sessionDetails->user_id == $user->data()->id) {
                            $db->update('ldshe_sessions', $sessionId, $session);
                            $saveSessionId = $sessionId;
                            $success['message'] = 'Sessions were updated';
                        } else {
                            $errors['message'] = 'You don\'t have permission to edit this session!';
                        }
                        unset($existSessions[$k]);
                    } else {
                        $db->insert('ldshe_sessions', $session);
                        $saveSessionId = $db->lastId();
                        $success['message'] = 'Sessions were saved';
                    }
                }
            }
            if (!empty($existSessions)) {
                foreach ($existSessions as $s) {
                    $db->deleteById('ldshe_sessions', $s->id);
                }
            }

            // Handle allocation of whole unit in session
            $existUnitAllocations = fetchAllAllocations($course_id, 'full');
            if (isset($_POST['units'])) {
                foreach($_POST['units'] as $u) {
                    $checkExist = array_filter($existUnitAllocations, function($v) use ($u) {
                        return $v->session==$u['session'] && $v->unit==$u['unit'] && $v->ordering= $u['ordering'];
                    });
                    if (empty($checkExist)) {
                        $unit_allocation = array(
                            'course_id' => $course_id,
                            'mode' => 'full',
                            'ordering' => $u['ordering'],
                            'session' => $u['session'],
                            'unit' => $u['unit']
                        );
                        $db->insert('ldshe_session_allocations', $unit_allocation);
                        $saveAllocationId = $db->lastId();
                    } else {
                        unset($existUnitAllocations[key($checkExist)]);
                    }
                }
            }
            if (!empty($existUnitAllocations)) {
                foreach ($existUnitAllocations as $a) {
                    $db->deleteById('ldshe_session_allocations', $a->id);
                }
            }

            // Handle allocation of activity in session
            $existActivityAllocations = fetchAllAllocations($course_id, 'single');
            if (isset($_POST['activities'])) {
                foreach($_POST['activities'] as $a) {
                    $checkExist = array_filter($existActivityAllocations, function($v) use ($a) {
                        return $v->session==$a['session']
                            && $v->unit==$a['unit']
                            && $v->activity==$a['activity']
                            && $v->instance==$a['instance']
                            && $v->ordering==$a['ordering'];
                    });
                    if (empty($checkExist)) {
                        $activity_allocation = array(
                            'course_id' => $course_id,
                            'mode' => 'single',
                            'ordering' => $a['ordering'],
                            'session' => $a['session'],
                            'unit' => $a['unit'],
                            'activity' => $a['activity'],
                            'instance' => $a['instance']
                        );
                        $db->insert('ldshe_session_allocations', $activity_allocation);
                        $saveAllocationId = $db->lastId();
                    } else {
                        unset($existActivityAllocations[key($checkExist)]);
                    }
                }
            }
            if (!empty($existActivityAllocations)) {
                foreach ($existActivityAllocations as $a) {
                    $db->deleteById('ldshe_session_allocations', $a->id);
                }
            }
        } else {
            $errors['message'] = "Course doesn't exist.";
        }

        if (!empty($success)) {
            $success['type'] = 'success';
            $success['message'] = 'Session allocations were saved';
            echo json_encode($success);
        } else {
            $errors['type'] = 'error';
            echo json_encode($errors);
        }
    //}
} else if (!empty($_GET['get_session_allocations'])) {
    if ($courseId = Input::get('get_session_allocations')) {
        if ($sessions = fetchAllSessions($courseId)) {
            if ($allocations = fetchAllAllocations($courseId)) {
                $return = (object)[];
                $return->sessions = $sessions;
                $return->allocations = $allocations;
                echo json_encode($return);
            }
        }
    } else {
        header("Location: ../../index.php");
    }
}
