<?php require_once '../init.php'; ?>
<?php require_once '../includes/course.php'; ?>
<?php if (!securePage($_SERVER['PHP_SELF'])){die();} ?>
<?php
$validation = new Validate();
$errors = array();
$success = array();
//Forms posted
if(!empty($_POST)) {
    $token = $_POST['csrf'];
    if(!Token::check($token)) {
        die('Token doesn\'t match!');
        $errors['message'] = 'Token doesn\'t match!';
    } else {
        /*
        $validation->check($_POST, array(
            'title' => array(
                'display' => 'courseTitle',
                'required' => true,
                'min' => 1
            )
        ));
        if($validation->passed()){
        }
        */

        $date = date("Y-m-d H:i:s");

        // Insert/update ldshe_courses
        $course = array(
            'user_id' => $user->data()->id,
            'title' => Input::get('courseTitle'),
            'subject' => Input::get('subject'),
            'teacher' => Input::get('teacher'),
            'class_size' => Input::get('classSize'),
            'session_num' => Input::get('numSessions'),
            'mode' => Input::get('learningMode'),
            'teach_time' => Input::get('teachingTime'),
            'self_time' => Input::get('selfStudyTime'),
            'type' => Input::get('courseType'),
            'prerequisites' => Input::get('prerequisites'),
            'unit_num' => Input::get('numLearnUnits'),
            'modified' => $date
        );

        $db = DB::getInstance();
        if($courseId = Input::get('courseId')) {
            if(courseIdExists($courseId)) {
                // course exist
                $courseDetails = fetchCourseDetails($courseId);
                if ($courseDetails->user_id == $user->data()->id) {
                    // current user is the author = have permission
                    $db->update('ldshe_courses', $courseId, $course);
                    $success['message'] = 'Course setting updated.';
                    $success['id'] = $courseId;
                } else {
                    $errors['message'] = 'You don\'t have permission to edit this course!';
                }
            } else {
                $errors['message'] = 'Course ID doesn\'t exist!';
            }
        } else {
            // new course
            $course['created'] = $date;
            $db->insert('ldshe_courses', $course);
            $success['message'] = 'Course created.';
            $success['id'] = $db->lastId();
        }

        if (isset($success['id'])) {
            // Insert/update/remove ldshe_outcomes
            $success['outcome_ids'] = array();
            $outcomes_rowOrder = explode(',', Input::get('outcomes_rowOrder'));
            if (!empty($outcomes_rowOrder)) {
                foreach ($outcomes_rowOrder as $key => $value) {
                    $outcome = array(
                        'course_id' => $success['id'],
                        'user_id' => $user->data()->id,
                        'ordering' => $key+1,
                        'type' => Input::get('outcomes_type_'.$value),
                        'description' => Input::get('outcomes_description_'.$value)
                    );
                    if (outcomePositionExist($success['id'], $key+1)) {
                        $outcomeDetails = fetchOutcomeDetails($success['id'], $key+1);
                        $db->update('ldshe_outcomes', $outcomeDetails->id, $outcome);
                        $success['outcome_ids'][] = $outcomeDetails->id;
                    } else {
                        $db->insert('ldshe_outcomes', $outcome);
                        $success['outcome_ids'][] = $db->lastId();
                    }
                }
            }
            // delete outcomes created before but removed now
            $all_outcomes = fetchCourseOutcomes($success['id']);
            foreach ($all_outcomes as $oc) {
                if (!in_array($oc->id, $success['outcome_ids'])) {
                    $db->deleteById('ldshe_outcomes', $oc->id);
                }
            }

            // Insert/update/remove ldshe_units
            $success['unit_ids'] = array();
            $units_rowOrder = explode(',', Input::get('unit-sequence_rowOrder'));
            if (!empty($units_rowOrder)) {
                foreach ($units_rowOrder as $key => $value) {
                    $unit = array(
                        'course_id' => $success['id'],
                        'user_id' => $user->data()->id,
                        'ordering' => $key+1,
                        'title' => Input::get('unit-sequence_title_'.$value),
                        'pedagogical_approach' => Input::get('unit-sequence_pedagogical_approach_'.$value),
                        'have_assessment' => Input::get('unit-sequence_have_assessment_'.$value),
                        'tc' => Input::get('unit-sequence_tc_'.$value),
                        'ts' => Input::get('unit-sequence_ts_'.$value),
                        'lo1' => Input::get('unit-sequence_lo1_'.$value),
                        'lo2' => Input::get('unit-sequence_lo2_'.$value),
                        'lo3' => Input::get('unit-sequence_lo3_'.$value),
                        'lo4' => Input::get('unit-sequence_lo4_'.$value),
                        'lo5' => Input::get('unit-sequence_lo5_'.$value),
                        'lo6' => Input::get('unit-sequence_lo6_'.$value),
                        'lo7' => Input::get('unit-sequence_lo7_'.$value),
                        'lo8' => Input::get('unit-sequence_lo8_'.$value),
                        'lo9' => Input::get('unit-sequence_lo9_'.$value),
                        'lo10' => Input::get('unit-sequence_lo10_'.$value),
                        'lo11' => Input::get('unit-sequence_lo11_'.$value),
                        'lo12' => Input::get('unit-sequence_lo12_'.$value)
                    );
                    if (unitPositionExist($success['id'], $key+1)) {
                        $unitDetails = fetchUnitDetails($success['id'], $key+1);
                        $db->update('ldshe_units', $unitDetails->id, $unit);
                        $success['unit_ids'][] = $unitDetails->id;
                    } else {
                        $db->insert('ldshe_units', $unit);
                        $success['unit_ids'][] = $db->lastId();
                    }
                }
            }
            // delete units created before but removed now
            $all_units = fetchUnits($success['id']);
            foreach ($all_units as $u) {
                if (!in_array($u->id, $success['unit_ids'])) {
                    $db->deleteById('ldshe_units', $u->id);
                }
            }
        }
    }
    if (count($errors) > 0) {
        echo json_encode($errors);
    } else {
        echo json_encode($success);
    }
} else if (!empty($_GET['get_outcomes'])) {
    if ($get_outcomes = Input::get('get_outcomes')) {
        $outcomes = fetchCourseOutcomes($get_outcomes);
        echo json_encode($outcomes);
    } else {
        header("Location: ../../index.php");
    }
} else if (!empty($_GET['get_all_designs'])) {
    if ($get_all_designs = Input::get('get_all_designs')) {
        $designs = fetchAllCourses($user->data()->id);
        $json = '{"data":[';
        foreach ($designs as $i => $d) {
            $json .= '[';
            $json .= '"'.$d->title.'",';
            $json .= '"'.$d->subject.'",';
            $json .= '"'.$d->teacher.'",';
            $json .= '"'.$d->class_size.'",';
            $json .= '"'.$d->session_num.'",';
            $json .= '"'.$d->id.'"';
            $json .= ']';
            if (($i+1) != count($designs)) $json .= ',';
        }
        $json .= ']}';
        echo $json;
    } else {
        header("Location: ../../index.php");
    }
} else if (!empty($_GET['delete_design'])) {
    if ($courseId = Input::get('delete_design')) {
        if(courseIdExists($courseId)) {
            $courseDetails = fetchCourseDetails($courseId);
            if ($courseDetails->user_id == $user->data()->id) {
                $db = DB::getInstance();
                $db->delete('ldshe_outcomes', array('course_id','=',$courseId));
                $db->delete('ldshe_units', array('course_id','=',$courseId));
                $db->deleteById('ldshe_courses', $courseId);
                $success['message'] = $courseDetails->title.' is deleted';
            } else {
                $errors['message'] = "No permission to delete";
            }
        } else {
            $errors['message'] = "Course doesn't exist";
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
} else if (!empty($_GET['copy_design'])) {
    if ($courseId = Input::get('copy_design')) {
        if(courseIdExists($courseId)) {
            $courseDetails = fetchCourseDetails($courseId);
            if ($courseDetails->user_id == $user->data()->id) {
                copyCourse($courseId);
                $success['message'] = $courseDetails->title.' is copied';
            } else {
                $errors['message'] = "No permission to copy";
            }
        } else {
            $errors['message'] = "Course doesn't exist";
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
} else {
    echo "No direct access to this file.";
    sleep(3);
    header("Location: ../../index.php");
    exit;
}
