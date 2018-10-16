<?php
/*
Learning Design Studio (Higher Education)
by Andy Chan (citeandy@hku.hk)
*/
?>
<?php
require_once 'init.php';
require_once $abs_us_root.$us_url_root.'lds/includes/header_design.php';
require_once $abs_us_root.$us_url_root.'users/includes/navigation.php';
require_once $abs_us_root.$us_url_root.'lds/includes/course.php';
?>

<?php if (!securePage($_SERVER['PHP_SELF'])){die();} ?>
<?php
//PHP Goes Here!
$courseId = Input::get('id');
//Check if selected course exists
if(courseIdExists($courseId)){
    $courseDetails = fetchCourseDetails($courseId);
    if ($courseDetails->user_id != $user->data()->id) {
        echo "<p class='bg-danger'>You do not have permission to access this course!</p>";
        echo '</body></html>';
        exit;
    }
    $unitOneDetail = fetchUnitDetails($courseId, 1);

    $sessions = fetchAllSessions($courseId);
} else {
    $courseDetails = newCourse();
}
$patterns = fetchAllPatterns($user->data()->id);
?>
<div id="tabs" class="container">
    <ul>
        <li><a href="#course-tab">Course Level</a></li>
        <li><a href="#unit-tab">Unit Level</a></li>
        <li class="session-tab"><a href="#session-tab">Session Level</a></li>
    </ul>
    <div id="course-tab" class="row">
        <form id="courseForm" class="form-horizontal">
            <h3 style="margin-top:0px;">Learning Context &amp; Forces Characteristics of the Course</h3>
            <div class="form-group">
                <label for="inputCourseTitle" class="col-md-3 control-label">Course Title</label>
                <div class="col-md-9">
                    <input type="text" class="form-control input-sm" name="courseTitle" id="inputCourseTitle" value="<?=$courseDetails->title?>" required placeholder="Enter the course title">
                    <input type="hidden" id="csrf" name="csrf" value="<?=Token::generate();?>" >
                    <input type="hidden" id="courseId" name="courseId" value="<?=$courseDetails->id?>" >
                </div>
            </div>
            <div class="form-group">
                <label for="inputSubject" class="col-md-3 control-label">Subject</label>
                <div class="col-md-9">
                    <input type="text" class="form-control input-sm" name="subject" id="inputSubject" value="<?=$courseDetails->subject?>" required placeholder="Enter the subject">
                </div>
            </div>
            <div class="form-group">
                <label for="inputTeacher" class="col-md-3 control-label">Teacher/Instructor</label>
                <div class="col-md-9">
                    <input type="text" class="form-control input-sm" name="teacher" id="inputTeacher" value="<?=$courseDetails->teacher?>" required placeholder="Enter the teacher or instrutor">
                </div>
            </div>
            <hr />
            <div class="form-group">
                <label for="inputClassSize" class="col-md-3 control-label">Class Size</label>
                <div class="col-md-9">
                    <input type="number" class="form-control input-sm" name="classSize" id="inputClassSize" value="<?=$courseDetails->class_size?>" required maxlength="5" min="1" max="99999" placeholder="Enter the class size">
                </div>
            </div>
            <div class="form-group">
                <label for="selectNumSessions" class="col-md-3 control-label">No. of Sessions</label>
                <div class="col-md-9">
                    <select class="form-control input-sm" name="numSessions" id="selectNumSessions">
						<option value="1" <?php if ($courseDetails->session_num==1){echo "selected='selected'";} ?>>1</option>
						<option value="2" <?php if ($courseDetails->session_num==2){echo "selected='selected'";} ?>>2</option>
						<option value="3" <?php if ($courseDetails->session_num==3){echo "selected='selected'";} ?>>3</option>
						<option value="4" <?php if ($courseDetails->session_num==4){echo "selected='selected'";} ?>>4</option>
						<option value="5" <?php if ($courseDetails->session_num==5){echo "selected='selected'";} ?>>5</option>
						<option value="6" <?php if ($courseDetails->session_num==6){echo "selected='selected'";} ?>>6</option>
						<option value="7" <?php if ($courseDetails->session_num==7){echo "selected='selected'";} ?>>7</option>
						<option value="8" <?php if ($courseDetails->session_num==8){echo "selected='selected'";} ?>>8</option>
						<option value="9" <?php if ($courseDetails->session_num==9){echo "selected='selected'";} ?>>9</option>
						<option value="10" <?php if ($courseDetails->session_num==10){echo "selected='selected'";} ?>>10</option>
						<option value="11" <?php if ($courseDetails->session_num==11){echo "selected='selected'";} ?>>11</option>
						<option value="12" <?php if ($courseDetails->session_num==12){echo "selected='selected'";} ?>>12</option>
						<option value="13" <?php if ($courseDetails->session_num==13){echo "selected='selected'";} ?>>13</option>
						<option value="14" <?php if ($courseDetails->session_num==14){echo "selected='selected'";} ?>>14</option>
						<option value="15" <?php if ($courseDetails->session_num==15){echo "selected='selected'";} ?>>15</option>
					</select>
                </div>
            </div>
            <div class="form-group">
                <label for="selectLearningMode" class="col-md-3 control-label">Mode of Learning</label>
                <div class="col-md-9">
                    <select class="form-control input-sm" name="learningMode" id="selectLearningMode">
						<option value="blended" <?php if ($courseDetails->mode=='blended'){echo "selected='selected'";} ?>>Blended</option>
						<option value="online" <?php if ($courseDetails->mode=='online'){echo "selected='selected'";} ?>>Online</option>
						<option value="f2f" <?php if ($courseDetails->mode=='f2f'){echo "selected='selected'";} ?>>Face-to-face only</option>
					</select>
                </div>
            </div>
            <div class="form-group">
                <label for="inputTeachingTime" class="col-md-3 control-label">Teaching Contact Time</label>
                <div class="col-md-9">
                    <input type="number" class="form-control input-sm" name="teachingTime" id="inputTeachingTime"  value="<?=$courseDetails->teach_time?>" placeholder="Enter the number of hours" required maxlength="3" min="1" max="999">
                </div>
            </div>
            <div class="form-group">
                <label for="inputSelfStudyTime" class="col-md-3 control-label">Self-study Time</label>
                <div class="col-md-9">
                    <input type="number" class="form-control input-sm" name="selfStudyTime" id="inputSelfStudyTime" value="<?=$courseDetails->self_time?>" placeholder="Enter the number of hours" required maxlength="3" min="1" max="999">
                </div>
            </div>
            <div class="form-group">
                <label for="selectCourseType" class="col-md-3 control-label">Type of Course</label>
                <div class="col-md-9">
                    <select class="form-control input-sm" name="courseType" id="selectCourseType">
						<option value="core" <?php if ($courseDetails->type=='core'){echo "selected='selected'";} ?>>Core</option>
						<option value="specialist" <?php if ($courseDetails->type=='specialist'){echo "selected='selected'";} ?>>Specialist</option>
						<option value="electives" <?php if ($courseDetails->type=='electives'){echo "selected='selected'";} ?>>Electives</option>
						<option value="iproject" <?php if ($courseDetails->type=='iproject'){echo "selected='selected'";} ?>>Independent project</option>
                        <option value="gproject" <?php if ($courseDetails->type=='gproject'){echo "selected='selected'";} ?>>Group project</option>
						<option value="dissertation" <?php if ($courseDetails->type=='dissertation'){echo "selected='selected'";} ?>>Dissertation</option>
					</select>
                </div>
            </div>
            <div class="form-group">
                <label for="selectPrerequisites" class="col-md-3 control-label">Prerequisites</label>
                <div class="col-md-9">
                    <select class="form-control input-sm" name="prerequisites" id="selectPrerequisites" placeholder="Select prerequisites...">
                        <option value="" <?php if ($courseDetails->prerequisites==''){echo "selected='selected'";} ?>>Select course prerequisites...</option>
                        <option value="na" <?php if ($courseDetails->prerequisites=='na'){echo "selected='selected'";} ?>>Not applicable</option>
                        <option value="bd" <?php if ($courseDetails->prerequisites=='bd'){echo "selected='selected'";} ?>>Bachelor's degree</option>
                        <option value="uer" <?php if ($courseDetails->prerequisites=='uer'){echo "selected='selected'";} ?>>University Entrance Requirements</option>
                    </select>
                </div>
            </div>
            <h3>Learning Outcomes</h3>
    		<div class="table-responsive">
    			<table id="outcomes" class="table table-bordered">
                    <!-- Columns defined by appendGrid JavaScript -->
    			</table>
    		</div>
            <h3>Pedagogical Unit Sequence</h3>
            <div id="time-type-bar" class="progress">
                <div class="progress-bar progress-bar-tc" style="width: 50%">
                </div>
                <div class="progress-bar progress-bar-ts" style="width: 50%">
                </div>
            </div>
            <div id="time-unit-bar" class="progress"></div>
            <div class="table-responsive">
    			<table id="unit-sequence" class="table table-bordered">
                    <!-- Columns defined by appendGrid JavaScript -->
    			</table>
    		</div>
        </form>
        <h3>Resources</h3>
        <div class="form-horizontal">
            <div class="form-group">
                <label for="" class="col-md-3 control-label">Select Files</label>
                <div class="col-md-9">
                    <div id="course_resources_uploader"></div>
                </div>
            </div>
        </div>
    </div>
    <div id="unit-tab" class="row">
        <h3 style="margin-top:0px;">Units Design</h3>
        <form id="unitForm" class="form-horizontal">
            <div id="all-units-container" class="row">
                <div class="col-md-4">
                    <div class="unit-container well">
                        <h4>Units 1</h4>
                        <div class="form-group">
                            <div class="col-sm-12">
                                <input type="text" class="form-control" id="inputUnitTitle1" name="inputUnitTitle1" placeholder="Title">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-12">
                                <input type="text" class="form-control" id="inputUnitPedagogicalApproach1" name="inputUnitPedagogicalApproach1" placeholder="Pedagogical Approach">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-12">
                                <textarea class="form-control" id="inputUnitDesc1" name="inputUnitDesc1" placeholder="Description" rows="3"></textarea>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-12 unit-objectives">
                                <!--<select class="form-control" id="selectUnitObj1" name="selectUnitObj1"></select>-->
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-12">
                                <a class="btn btn-primary edit-pattern-btn"><i class="fa fa-pencil" aria-hidden="true"></i> Edit learning pattern</a>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-sm-12">
                                <div class="previewUnitPattern"><p>No pattern for preview yet</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <div id="session-tab" class="row">
        <div class="alert alert-danger" style="margin-bottom: 5px;">
            <strong>This part is still under development.</strong>
        </div>
        <div class="session-allocation">
            <div class="unit-draggable-container"></div>
            <div class="session-droppable-container">
                <table id="session-droppable" class="table table-bordered">
                    <thead>
                        <tr>
                            <th class="session_title">Sessions</th>
                            <th>Allocation of Units<input type="hidden" id="session_csrf" name="session_csrf" value="<?=LDSToken::generate('session');?>" ></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                            for ($i=0; $i<$courseDetails->session_num; $i++) {
                                $sessionTitle = isset($sessions[$i]) ? $sessions[$i]->title:'';
                        ?>
                        <tr>
                            <td>
                                <h4><?=$i+1?></h4>
                                <div class="form-group">
                                    <div class="col-sm-12">
                                        <input type="text" class="form-control" id="inputSessionTitle<?=$i+1?>" value="<?=$sessionTitle?>" name="inputSessionTitle<?=$i+1?>" placeholder="Session Title">
                                    </div>
                                </div>
                            </td>
                            <td class="session_detail">
                                <div data-session="<?=$i+1?>"></div>
                            </td>
                        </tr>
                        <?php } ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div id="pattern-tab" class="row">
        <div id="flowChartView">
            <div id="flowchartTopbar" class="row">
                <div id="flowchartTitleDiv" class="col-md-8 form-inline">
                    <div class="form-group">
                        <label for="patternName" class="control-label">Pattern Name:</label>
                        <input type="text" class="form-control" name="patternName" id="patternName" value="" placeholder="Enter the Pattern Name">
                        <input type="hidden" id="pattern_csrf" name="pattern_csrf" value="<?=LDSToken::generate('pattern');?>" >
                        <input type="hidden" id="patternId" name="patternId" value="">
                    </div>
                </div>
                <div id="flowchartLoad" class="col-md-4">
                    <div class="form-group">
                    <?php if (empty($patterns)) { ?>
                        <select id="patterns_list" class="form-control" disabled>
                            <option value="">No existing pattern</option>
                        </select>
                        <button class="form-control btn btn-success" disabled>Load Pattern</button>
                    <?php } else { ?>
                        <select id="patterns_list" class="form-control">
                            <option value="">Select a pattern...</option>
                    <?php
                        foreach ($patterns as $p) {
                            if (trim($p->name) == "") {
                                $name = '[Pattern with id='.$p->id.']';
                            } else {
                                $name = $p->name;
                            }
                            echo '<option value="'.$p->id.'">'.$name.'</option>';
                        }
                    ?>
                        </select>
                        <button class="form-control btn btn-success" id="load_patterns">Load Pattern</button>
                    <?php } ?>
                    </div>
                </div>
            </div>
            <div id="flowChartContainer">
                <div class="accept"></div>
                <div id="myPalette">
                    <p class="panelTitle">Task Types</p>
                    <div class="jtk-demo-main">
                        <div class="jtk-demo-canvas canvas-wide flowchart-demo" id="canvas1">
                            <div class="window reflective jsplumb-connected" id="reflectiveEv">
                                <p>Reflective</p>
                                <div class="drag-handles">
                                    <div id="handle-r1" data-toggle="tooltip" title="Revision">Rev</div>
                                    <div id="handle-r2" data-toggle="tooltip" title="Reflection">Ref</div>
                                    <div id="handle-r3" data-toggle="tooltip" title="Self-/Peer-assessment">SPA</div>
                                </div>
                            </div>
                            <div class="window productive jsplumb-connected" id="productiveEv">
                                <p>Productive</p>
                                <div class="drag-handles">
                                    <div id="handle-c1" data-toggle="tooltip" title="Construction: Conceptual/Visual Artefacts">CCV</div>
                                    <div id="handle-c2" data-toggle="tooltip" title="Construction: Tangible/Manipulable Artifacts">CTM</div>
                                    <div id="handle-c3" data-toggle="tooltip" title="Presentations, Performance Illustrations">PPI</div>
                                </div>
                            </div>
                            <div class="window exploratory jsplumb-connected" id="exploratoryEv">
                                <p>Exploratory</p>
                                <div class="drag-handles">
                                    <div id="handle-e1" data-toggle="tooltip" title="Tangible/Immersive Investigation">TII</div>
                                    <div id="handle-e2" data-toggle="tooltip" title="Explorations through Conversation">EtC</div>
                                    <div id="handle-e3" data-toggle="tooltip" title="Information Exploration">IE</div>
                                </div>
                            </div>
                            <div class="window directed jsplumb-connected" id="directedEv">
                                <p>Directed</p>
                                <div class="drag-handles">
                                    <div id="handle-d1" data-toggle="tooltip" title="Test/Assessment">T/A</div>
                                    <div id="handle-d2" data-toggle="tooltip" title="Practice">Pra</div>
                                    <div id="handle-d3" data-toggle="tooltip" title="Receiving & Interpreting Information">RII</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="myDiagram">
                    <p class="panelTitle">Arrangement <i class="fa fa-magic" id="autolayoutBtn" title="Auto rearrange the layout"></i></p>
                    <div class="jtk-demo-main">
                        <div class="jtk-demo-canvas canvas-wide flowchart-demo jtk-surface  jtk-surface-nopan" id="canvas">
                        </div>
                    </div>
                </div>
                <div id="mySetting">
                    <p class="panelTitle">Task Settings</p>
                    <div id="activitySettingForm">
                        <form class="form-horizontal">
                            <div class="form-group">
                                <label for="selectActivityType" class="col-md-3 control-label">Type</label>
                                <div class="col-md-9">
                                    <select class="form-control input-sm" id="selectActivityType"></select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="textareaActivityDesc" class="col-md-3 control-label">Description</label>
                                <div class="col-md-9">
                                    <textarea class="form-control" id="textareaActivityDesc" placeholder="Description" rows="4"></textarea>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="inputActivityAssessment" class="col-md-3 control-label">Assessment</label>
                                <div class="col-md-9">
                                    <label class="radio-inline">
                                        <input type="radio" name="inputActivityAssessment" id="inputActivityAssessmentN" value="0"> No
                                    </label>
                                    <label class="radio-inline">
                                        <input type="radio" name="inputActivityAssessment" id="inputActivityAssessmentY" value="1"> Yes
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="selectActivitySocial" class="col-md-3 control-label">Social Org.</label>
                                <div class="col-md-9">
                                    <select class="form-control input-sm" id="selectActivitySocial">
                                        <option selected disabled value="">Select an option...</option>
                                        <option value="group">Group</option>
                                        <option value="individual">Individual</option>
                                        <option value="peer">Peer-review</option>
                                        <option value="class">Whole Class</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" id="groupSizeDiv">
                                <label for="selectActivityGroupSize" class="col-md-3 control-label">Group Size</label>
                                <div class="col-md-9">
                                    <select class="form-control input-sm" id="selectActivityGroupSize">
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="selectActivityFeedback" class="col-md-3 control-label">Feedback</label>
                                <div class="col-md-9">
                                    <select class="form-control input-sm" id="selectActivityFeedback" multiple placeholder="Select...">
                                        <option value="">Select...</option>
                                        <option value="auto">Automated Feedback</option>
                                        <option value="group">Group Feedback</option>
                                        <option value="indiv">Individual Feedback</option>
                                        <option value="peer">Peer-review/Feedback</option>
                                        <option value="score">Score</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="selectActivityMotivator" class="col-md-3 control-label">Motivator</label>
                                <div class="col-md-9">
                                    <select class="form-control input-sm" id="selectActivityMotivator" multiple placeholder="Select...">
                                        <option value="">Select...</option>
                                        <option value="badges">Badges</option>
                                        <option value="leaderboard">Leaderboard</option>
                                        <option value="p_competition">Peer Competition</option>
                                        <option value="p_response">Peer Response (Quantity and Quality)</option>
                                        <option value="score">Score</option>
                                        <option value="team_agency">Team Agency</option>
                                        <option value="indiv_agency">Individual Agency</option>
                                        <option value="extra">Extra Activities</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="inputActivityDuration" class="col-md-3 control-label">Duration</label>
                                <div class="col-md-9">
                                    <input type="number" class="form-control input-sm" id="inputActivityDuration" min="1" max="999" value="1" placeholder="Duration"> min
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="selectActivitySetting" class="col-md-3 control-label">Setting</label>
                                <div class="col-md-9">
                                    <select class="form-control input-sm" id="selectActivitySetting">
                                        <option value="">Select...</option>
                                        <option value="f2fs">Face-to-face (Synchronous)</option>
                                        <option value="f2fc">Face-to-face (Classroom)</option>
                                        <option value="f2ffw">Face-to-face (Field Work)</option>
                                        <option value="informal">Informal (On or Offline)</option>
                                        <option value="onlinea">Online (Asynchronous)</option>
                                        <option value="onlines">Online (Synchronous)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="selectActivityResources" class="col-md-3 control-label">Resources</label>
                                <div class="col-md-9">
                                    <select class="form-control input-sm" id="selectActivityResources" multiple placeholder="Select...">
                                        <option value="">Select...</option>
                                        <option value="r1">Additional Examples</option>
                                        <option value="r2">Assessment Rubric</option>
                                        <option value="r3">Audio</option>
                                        <option value="r4">Book</option>
                                        <option value="r5">Book Chapter</option>
                                        <option value="r6">Checklist</option>
                                        <option value="r7">Course/Session Outline</option>
                                        <option value="r23">Demo Video</option>
                                        <option value="r24">Interactive Learning Material</option>
                                        <option value="r8">Lecture Text</option>
                                        <option value="r9">Lecture Video</option>
                                        <option value="r10">Paper</option>
                                        <option value="r11">PPT Slides</option>
                                        <option value="r12">Quiz</option>
                                        <option value="r13">Sample Work by Students</option>
                                        <option value="r14">Survey</option>
                                        <option value="r15">Task Example</option>
                                        <option value="r16">Template</option>
                                        <option value="r17">Tutorial Text</option>
                                        <option value="r18">Tutorial Video</option>
                                        <option value="r19">Video</option>
                                        <option value="r20">Website</option>
                                        <option value="r21">Worksheet</option>
                                        <option value="r22">Writing Template</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="selectActivityTools" class="col-md-3 control-label">Tools</label>
                                <div class="col-md-9">
                                    <select class="form-control input-sm" id="selectActivityTools" multiple placeholder="Select...">
                                        <option value="">Select...</option>
                                        <option value="t1">Blog</option>
                                        <option value="t2">Brainstorming Tool</option>
                                        <option value="t3">Chatroom</option>
                                        <option value="t4">Discussion Forum</option>
                                        <option value="t5">e-Portfolio</option>
                                        <option value="t6">LMS-Moodle</option>
                                        <option value="t7">Mind-mapping Tool</option>
                                        <option value="t8">Online Assign Submission</option>
                                        <option value="t9">Online Shared Drive</option>
                                        <option value="t10">Online Shared Workspace</option>
                                        <option value="t11">Programming Language</option>
                                        <option value="t12">Quiz Tool</option>
                                        <option value="t13">Survey Tool</option>
                                        <option value="t14">Survey-Poll</option>
                                        <option value="t15">Video Quiz</option>
                                        <option value="t16">Wiki</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="textareaActivityNotes" class="col-md-3 control-label">Notes &amp; Observations</label>
                                <div class="col-md-9">
                                    <textarea class="form-control" id="textareaActivityNotes" placeholder="Notes &amp; Observations" rows="4"></textarea>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-offset-3 col-sm-9">
                                    <button type="button" id="btnSaveActivity" class="btn btn-primary">Save</button>
                                    <button type="button" id="btnResetActivity" class="btn btn-danger">Reset</button>
                                    <button type="button" id="btnSampleActivity" class="btn btn-info">Sample</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div id="button-panel" class="container">
    <div class="row">
        <div class="form-group">
            <div class="col-sm-offset-9 col-sm-3 bottom-buttons-panel">
                <button id="saveCourseLevel" type="submit" class="btn btn-primary">Save</button>
                <button id="cancelCourseLevel" type="button" class="btn btn-default">Cancel</button>
            </div>
        </div>
    </div>
</div>

<!-- footers -->
<?php require_once $abs_us_root.$us_url_root.'users/includes/page_footer.php'; // the final html footer copyright row + the external js calls ?>

<!-- Place any per-page javascript here -->
<script src="js/underscore-min.js"></script>
<script src="js/alertify.js"></script>
<script src="js/jquery.validate.min.js"></script>
<script src="js/additional-methods.min.js"></script>
<script src="js/jquery-ui.min.js"></script>
<script src="js/microplugin.min.js"></script>
<script src="js/selectize.min.js"></script>
<script src="js/jquery.appendGrid-1.6.3.min.js"></script>
<script src="fine-uploader/jquery.fine-uploader.min.js"></script>
<script src="js/jsplumb.min.js"></script>
<script src="js/jquery.simulate.js"></script>
<script src="js/jquery.simulate.ext.js"></script>
<script src="js/jquery.simulate.drag-n-drop.js"></script>
<script src="js/pattern.js"></script>
<script src="js/design.js"></script>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; // currently just the closing /body and /html ?>
