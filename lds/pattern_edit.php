<?php
/*
UserSpice 4
An Open Source PHP User Management System
by the UserSpice Team at http://UserSpice.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
?>
<?php
require_once 'init.php';
require_once $abs_us_root.$us_url_root.'lds/includes/header_pattern.php';
$display = Input::get('display');
$div_class = 'patternModal';
if ($display != "modal" ) {
    require_once $abs_us_root.$us_url_root.'users/includes/navigation.php';
    $div_class = '';
}
require_once $abs_us_root.$us_url_root.'lds/includes/pattern.php';
?>

<?php if (!securePage($_SERVER['PHP_SELF'])){die();} ?>
<?php
//PHP Goes Here!
$patternId = Input::get('id');
//Check if selected pattern exists
if(patternIdExists($patternId)){
    $patternDetails = fetchPatternDetails($patternId);
    if ($patternDetails->user_id != $user->data()->id) {
        echo "<p class='bg-danger'>You do not have permission to access this pattern!</p>";
        echo '</body></html>';
        exit;
    }
} else {
    $patternDetails = newPattern();
}
?>
<div id="flowChartView" class="<?=$div_class?>">
    <div id="flowchartTopbar" class="row">
        <div id="flowchartTitleDiv" class="col-md-10 form-inline">
            <div class="form-group">
                <label for="patternName" class="control-label">Pattern Name:</label>
                <input type="text" class="form-control" name="patternName" id="patternName" value="<?=$patternDetails->name?>" placeholder="Enter the Pattern Name" required>
                <input type="hidden" id="pattern_csrf" name="pattern_csrf" value="<?=LDSToken::generate("pattern");?>" >
                <input type="hidden" id="patternId" name="patternId" value="<?=$patternDetails->id?>">
            </div>
        </div>
        <div id="flowchartSave" class="col-md-2">
            <button class="btn btn-success">Save Pattern</button>
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
                            <div id="handle-r1" data-toggle="tooltip" title="Revision"></div>
                            <div id="handle-r2" data-toggle="tooltip" title="Reflection"></div>
                            <div id="handle-r3" data-toggle="tooltip" title="Self-/Peer-assessment"></div>
                        </div>
                    </div>
                    <div class="window productive jsplumb-connected" id="productiveEv">
                        <p>Productive</p>
                        <div class="drag-handles">
                            <div id="handle-c1" data-toggle="tooltip" title="Construction: Conceptual/Visual Artefacts"></div>
                            <div id="handle-c2" data-toggle="tooltip" title="Construction: Tangible/Manipulable Artifacts"></div>
                            <div id="handle-c3" data-toggle="tooltip" title="Presentations, Performance Illustrations"></div>
                        </div>
                    </div>
                    <div class="window exploratory jsplumb-connected" id="exploratoryEv">
                        <p>Exploratory</p>
                        <div class="drag-handles">
                            <div id="handle-e1" data-toggle="tooltip" title="Tangible/Immersive Investigation"></div>
                            <div id="handle-e2" data-toggle="tooltip" title="Explorations through Conversation"></div>
                            <div id="handle-e3" data-toggle="tooltip" title="Information Exploration"></div>
                        </div>
                    </div>
                    <div class="window directed jsplumb-connected" id="directedEv">
                        <p>Directed</p>
                        <div class="drag-handles">
                            <div id="handle-d1" data-toggle="tooltip" title="Test/Assessment"></div>
                            <div id="handle-d2" data-toggle="tooltip" title="Practice"></div>
                            <div id="handle-d3" data-toggle="tooltip" title="Receiving & Interpreting Information"></div>
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
<!-- footers -->
<?php require_once $abs_us_root.$us_url_root.'users/includes/page_footer.php'; // the final html footer copyright row + the external js calls ?>

<!-- Place any per-page javascript here -->
<script src="js/underscore-min.js"></script>
<script src="js/alertify.js"></script>
<script src="js/jquery-ui.min.js"></script>
<script src="js/microplugin.min.js"></script>
<script src="js/selectize.min.js"></script>
<script src="fine-uploader/jquery.fine-uploader.min.js"></script>
<script src="js/jsplumb.min.js"></script>
<script src="js/jquery.simulate.js"></script>
<script src="js/jquery.simulate.ext.js"></script>
<script src="js/jquery.simulate.drag-n-drop.js"></script>
<script src="js/pattern.js"></script>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; // currently just the closing /body and /html ?>
