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
            '$courseId' => array(
                'display' => '$courseId',
                'required' => true,
                'min' => 1
            )
        ));
        if($validation->passed()){
        }
        */

        $date = date("Y-m-d H:i:s");
        // Update ldshe_units (unit must exist)
        $db = DB::getInstance();
        $success['unit_ids'] = array();
        $fieldIndex = 1;
        $unitOrder = explode(",", Input::get('unitOrder'));
        $courseId = Input::get('courseId');
        while (isset($_POST['inputUnitTitle'.$fieldIndex])) {
            $ordering = array_search($fieldIndex, $unitOrder)+1;
            $unit = array(
                'title' => Input::get('inputUnitTitle'.$fieldIndex),
                'pedagogical_approach' => Input::get('inputUnitPedagogicalApproach'.$fieldIndex),
                'description' => Input::get('inputUnitDesc'.$fieldIndex)
            );
            if (unitPositionExist($courseId, $ordering)) {
                $unitDetails = fetchUnitDetails($courseId, $ordering);
                $db->update('ldshe_units', $unitDetails->id, $unit);
                $success['unit_ids'][] = $unitDetails->id;
                $success['message'] = 'Unit level setting updated.';
            } else {
                $errors['message'] = 'Unit '.$ordering.' not exist.';
            }
            $fieldIndex++;
        }
    }
    if (count($errors) > 0) {
        echo json_encode($errors);
    } else {
        echo json_encode($success);
    }
} else if (!empty($_GET['get_units'])) {
    if ($get_units = Input::get('get_units')) {
        $units = fetchUnits($get_units);
        echo json_encode($units);
    } else {
        header("Location: ../../index.php");
    }
} else {
    echo "No direct access to this file.";
    sleep(3);
    header("Location: ../../index.php");
    exit;
}
