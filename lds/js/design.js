// Objective categories
var objective_str = {
    0: "Unknown",
    d_knowledge: "Disciplinary Knowledge",
    d_skills: "Disciplinary Skills",
    g_skills: "Generic Skills"
};

var objective_color = {
    d_knowledge: "red",
    d_skills: "blue",
    g_skills: "green"
}

var co_optgroups = [{
        label: objective_str.d_knowledge,
        value: 'd_knowledge'
    },
    {
        label: objective_str.d_skills,
        value: 'd_skills'
    },
    {
        label: objective_str.g_skills,
        value: 'g_skills'
    }
];

$(function() {
    // global vars
    var objectiveLabels = [];
    var patterns = {};
    var sessionDropHistory = [];

    // init tabs
    var tabs = $("#tabs").tabs();
    // init form validation
    $("#saveCourseLevel").click(function() {
        $("#courseForm").submit();
    });
    $("#courseForm").validate({
        submitHandler: function(form) {
            var courseFormData = $(form).serializeArray();
            //console.log(courseFormData);
            $.ajax({
                type: "POST",
                url: "db/course_level.php",
                data: courseFormData,
                dataType: "json",
                success: function(data) {
                    $("#courseId").val(data['id']);
                    alertify.success(data['message']);
                    $.get("token.php", function(data) {
                        $("#csrf").val(data);
                        $("#unitForm").submit();
                    });
                },
                error: function() {
                    $.get("token.php", function(data) {
                        $("#csrf").val(data);
                        //$("#unitForm").submit();
                    });
                    alertify.error("Error submitting the form.");
                }
            });
        }
    });

    $("#unitForm").validate({
        submitHandler: function(form) {
            var unitFormData = $(form).serializeArray();
            unitFormData.push({name:"csrf", value:$("#csrf").val()});
            unitFormData.push({name:"courseId", value:$("#courseId").val()});
            unitFormData.push({name:"unitOrder", value:$("#unit-sequence_rowOrder").val()});
            $.ajax({
                type: "POST",
                url: "db/unit_level.php",
                data: unitFormData,
                dataType: "json",
                success: function(data) {
                    alertify.success(data['message']);
                    $.get("token.php", function(data) {
                        $("#csrf").val(data);
                        saveUnitPatterns(patterns);
                    });
                },
                error: function() {
                    $.get("token.php", function(data) {
                        $("#csrf").val(data);
                        //saveUnitPatterns(patterns);
                    });
                    alertify.error("Error submitting the form.");
                }
            });
        }
    });

    // Assignment appendGrid table
    /*
    $('#assignments').appendGrid({
        initRows: 3,
        hideRowNumColumn: 'false',
        columns: [
            { name: 'id', display: 'ID', type: 'text', displayCss: {'width': '10%' }, ctrlClass: 'form-control input-sm', ctrlAttr: { maxlength: 2 }, ctrlCss: { width: '100%'} },
            { name: 'groupmode', display: 'Group Mode', type: 'select', displayCss: {'width': '20%' }, ctrlClass: 'form-control input-sm', ctrlOptions: { 0: 'Select...', 'individual': 'Individual', 'group': 'Group'}, ctrlCss: { width: '100%' } },
            { name: 'description', display: 'Description', type: 'text', displayCss: {'width': '55%' }, ctrlClass: 'form-control input-sm', ctrlAttr: { maxlength: 255 }, ctrlCss: { width: '100%' } },
            { name: 'RecordId', type: 'hidden', value: 0 }
        ],
        afterRowAppended: function (caller, parentRowIndex, addedRowIndex) {
            initAssignmentIdAutocomp();
            initAssignmentDescAutocomp();
        }
    });
    */

    // Outcomes appendGrid table
    var outcome_type = {0: 'Select a type...', 'd_knowledge': 'Disciplinary Knowledge', 'd_skills': 'Disciplinary Skills', 'g_skills': 'Generic Skills'};
    var col_width = '80%';

    $('#outcomes').appendGrid({
        initRows: 3,
        maxRowsAllowed: 12,
        columns: [
            { name: 'type', display: 'Type', type: 'select', displayCss: {'width': col_width }, ctrlClass: 'form-control input-sm', ctrlOptions: outcome_type },
            //{ name: 'assessment', display: 'Assessment', type: 'select', displayCss: {'width': col_width }, ctrlClass: 'form-control input-sm', ctrlAttr: { }  },
            //{ name: 'motivation', display: 'Motivation', type: 'text', displayCss: {'width': col_width }, ctrlClass: 'form-control input-sm' }
        ],
        useSubPanel: true,
        subPanelBuilder: function(cell, uniqueIndex) {
            // Create a textarea
            $('<textarea></textarea>').css({'vertical-align': 'middle', 'width': '84%'}).addClass('form-control input-sm').attr({
                id: 'outcomes_description_' + uniqueIndex,
                name: 'outcomes_description_' + uniqueIndex,
                placeholder: 'Description',
                rows: 2, cols: 60
            }).appendTo(cell);
        },
        subPanelGetter: function(uniqueIndex) {
            return { 'description': $('#outcomes_description_'+uniqueIndex).val() };
        },
        rowDataLoaded: function(caller, record, rowIndex, uniqueIndex) {
            if (record.description) {
                var elem = $('#outcomes_description_'+uniqueIndex);
                elem.val(record.description);
            }
        },
        afterRowInserted: function(caller, parentRowIndex, addedRowIndex) {
            // add color to type
            var selectType = $(caller).appendGrid('getCellCtrl', 'type', addedRowIndex);
            $(selectType).change(function() {
                changeCourseObjColor($(this));
                initCourseObjAutocomp($(this));
                initOutcomeTooltips();
            });
            // show hiddien LO column
            if ($('#unit-sequence').appendGrid('isReady')) {
                var lo_num = parseInt(addedRowIndex)+1;
                var outcome_count = $('#outcomes').appendGrid('getRowCount');
                var unit_count = $('#unit-sequence').appendGrid('getRowCount');
                for (u=1; u<=unit_count; u++) {
                    for (o=outcome_count; o>=lo_num+1; o--) {
                        var copyfrom = $('#unit-sequence_lo'+(o-1)+'_'+u).prop('checked');
                        $('#unit-sequence_lo'+o+'_'+u).prop('checked', copyfrom);
                        $('#unit-sequence_lo'+(o-1)+'_'+u).prop('checked', false);
                    }
                }
                $('#unit-sequence').appendGrid('showColumn', 'lo'+outcome_count);
                updateObjLabels();
                allocateCourseObjLabels();
            }
        },
        afterRowAppended: function (caller, parentRowIndex, addedRowIndex) {
            // add color to type
            var selectType = $(caller).appendGrid('getCellCtrl', 'type', addedRowIndex);
            $(selectType).change(function() {
                changeCourseObjColor($(this));
                initCourseObjAutocomp($(this));
                updateObjLabels();
                allocateCourseObjLabels();
                initOutcomeTooltips();
            });
            updateObjLabels();
            // show hiddien LO column
            if ($('#unit-sequence').appendGrid('isReady')) {
                var lo_num = parseInt(addedRowIndex)+1;
                $('#unit-sequence').appendGrid('showColumn', 'lo'+lo_num);
                allocateCourseObjLabels();
            }

            $('textarea[id^="outcomes_description_"]').change(function() {
                updateObjLabels();
                allocateCourseObjLabels();
                initOutcomeTooltips();
            });
        },
        afterRowRemoved: function(caller, rowIndex) {
            if (isNaN(rowIndex)) {
                rowIndex = $('#outcomes').appendGrid('getRowCount')+1;
            }
            var lo_num = parseInt(rowIndex)+1;
            var outcome_count = $('#outcomes').appendGrid('getRowCount')+1;
            if (lo_num != outcome_count) {
                var unit_count = $('#unit-sequence').appendGrid('getRowCount');
                for (u=1; u<=unit_count; u++) {
                    for (o=lo_num; o<=outcome_count; o++) {
                        var copyfrom = $('#unit-sequence_lo'+(o+1)+'_'+u).prop('checked');
                        $('#unit-sequence_lo'+o+'_'+u).prop('checked', copyfrom);
                    }
                }
            }
            $('input[id^="unit-sequence_lo'+outcome_count+'_"]').prop('checked', false);
            $('#unit-sequence').appendGrid('hideColumn', 'lo'+outcome_count);
            updateObjLabels();
            allocateCourseObjLabels();
        },
        dataLoaded: function (caller, records) {
            // add color to type
            $('select[id^="outcomes_type_"]').each(function() {
                changeCourseObjColor($(this));
                initCourseObjAutocomp($(this));
            }).change(function() {
                changeCourseObjColor($(this));
                initCourseObjAutocomp($(this));
                updateObjLabels();
                allocateCourseObjLabels();
                changeOutcomeTooltips($(this).attr('id'));
            });
            $('textarea[id^="outcomes_description_"]').change(function() {
                updateObjLabels();
                allocateCourseObjLabels();
                changeOutcomeTooltips($(this).attr('id'));
            });
            if ($('#unit-sequence').appendGrid('isReady')) {
                var outcome_count = $('#outcomes').appendGrid('getRowCount');
                for (i=1; i<=outcome_count; i++) {
                    $('#unit-sequence').appendGrid('showColumn', 'lo'+i);
                }
                for (i=outcome_count+1; i<=3; i++) {
                    $('#unit-sequence').appendGrid('hideColumn', 'lo'+i);
                }
            }
            updateObjLabels();
        }
    });

    var exist_outcomes = [];
    if ($("#courseId").val()) {
        $.get("db/course_level.php",
            {get_outcomes: $('#courseId').val()}
        ).done(function(data) {
            if (data.length) {
                exist_outcomes = JSON.parse(data);
                $('#outcomes').appendGrid('load', exist_outcomes);
            }
        });
    }

    $('#unit-sequence').appendGrid({
        initRows: 1,
        columns: [
            {name: 'title', display: 'Unit Title', type: 'text', displayCss: {'min-width': '20%'}, ctrlClass: 'form-control input-sm'},
            {name: 'pedagogical_approach', display: 'Pedagogical Approach', type: 'text', displayCss: {'min-width': '20%' }, ctrlClass: 'form-control input-sm'},
            {name: 'lo1', display: 'LO1',  type: 'checkbox', displayCss: {'width': '4%'}},
            {name: 'lo2', display: 'LO2',  type: 'checkbox', displayCss: {'width': '4%'}},
            {name: 'lo3', display: 'LO3',  type: 'checkbox', displayCss: {'width': '4%'}},
            {name: 'lo4', display: 'LO4',  type: 'checkbox', displayCss: {'width': '4%'}, invisible: true},
            {name: 'lo5', display: 'LO5',  type: 'checkbox', displayCss: {'width': '4%'}, invisible: true},
            {name: 'lo6', display: 'LO6',  type: 'checkbox', displayCss: {'width': '4%'}, invisible: true},
            {name: 'lo7', display: 'LO7',  type: 'checkbox', displayCss: {'width': '4%'}, invisible: true},
            {name: 'lo8', display: 'LO8',  type: 'checkbox', displayCss: {'width': '4%'}, invisible: true},
            {name: 'lo9', display: 'LO9',  type: 'checkbox', displayCss: {'width': '4%'}, invisible: true},
            {name: 'lo10', display: 'LO10',  type: 'checkbox', displayCss: {'width': '4%'}, invisible: true},
            {name: 'lo11', display: 'LO11',  type: 'checkbox', displayCss: {'width': '4%'}, invisible: true},
            {name: 'lo12', display: 'LO12',  type: 'checkbox', displayCss: {'width': '4%'}, invisible: true},
            {
                name: 'have_assessment',
                display: function(cell) {
                    $(cell).attr({
                        'data-toggle': 'tooltip',
                        'title': 'Have assessment?'
                    });
                    $('<span></span>').attr('class', 'glyphicon glyphicon-check').appendTo(cell);
                },
                type: 'checkbox',
                displayCss: {'width': '5%', 'text-align': 'center'}
            },
            {
                name: 'tc',
                display: function(cell) {
                    $(cell).attr({
                        'data-toggle': 'tooltip',
                        'title': 'Teaching contact time'
                    });
                    $('<span></span>').attr('class', 'glyphicon glyphicon-time').appendTo(cell);
                    $('<span></span>').text(' T-c').appendTo(cell);
                },
                ctrlAttr: {'readonly': 'readonly'},
                displayCss: {'width': '8%', 'text-align': 'center'},
                ctrlClass: 'form-control input-sm'
            },
            {
                name: 'ts',
                display: function(cell) {
                    $(cell).attr({
                        'data-toggle': 'tooltip',
                        'title': 'Self-study time'
                    });
                    $('<span></span>').attr('class', 'glyphicon glyphicon-time').appendTo(cell);
                    $('<span></span>').text(' T-s').appendTo(cell);
                },
                ctrlAttr: {'readonly': 'readonly'},
                displayCss: {'width': '8%', 'text-align': 'center'},
                ctrlClass: 'form-control input-sm'
            }
        ],
        afterRowAppended: function(caller, parentRowIndex, addedRowIndex) {
            var i = parseInt(addedRowIndex);
            if (i) addUnits(i, i+1);
            // Sync text fields
            syncInputFields($('#inputUnitTitle'+(i+1)), $('#unit-sequence_title_'+(i+1)));
            syncInputFields($('#inputUnitPedagogicalApproach'+(i+1)), $('#unit-sequence_pedagogical_approach_'+(i+1)));
            initUnitTimeFieldEvent();
            $('input[id^="unit-sequence_lo"][id$="_'+(i+1)+'"]').change(function() {
                allocateCourseObjLabels(i+1);
            });
        },
        afterRowInserted: function(caller, parentRowIndex, addedRowIndex) {
            initUnitTimeFieldEvent();
            var lastUnitIndex = $("#unitForm > .row > div").length;
            var fieldNameNum = lastUnitIndex+1;
            addUnits(lastUnitIndex, fieldNameNum);
            var e = $("#unitForm > .row > div:eq("+lastUnitIndex+")").detach();
            $("#unitForm > .row > div:eq("+(addedRowIndex[0]-1)+")").after(e);
            syncInputFields($('#inputUnitTitle'+fieldNameNum), $('#unit-sequence_title_'+fieldNameNum));
            syncInputFields($('#inputUnitPedagogicalApproach'+fieldNameNum), $('#unit-sequence_pedagogical_approach_'+fieldNameNum));
            $('input[id^="unit-sequence_lo"][id$="_'+fieldNameNum+'"]').change(function() {
                allocateCourseObjLabels(fieldNameNum);
            });
            reorderUnitTitle();
        },
        afterRowRemoved: function(caller, rowIndex) {
            $(".unit-container").slice(rowIndex, rowIndex+1).parent().remove();
            reorderUnitTitle();

            var patternTab = $(tabs).find('.ui-tabs-nav li[data-unitnum="'+(rowIndex+1)+'"]');
            if (patternTab.length) {
                patternTab.closest("li").remove().attr("aria-controls");
                $("#pattern-tab").hide();
                $(tabs).tabs("refresh");
                $(tabs).tabs('option', 'active', 0);
            }
            delete patterns[rowIndex+1];
        },
        afterRowSwapped: function(caller, oldRowIndex, newRowIndex) {
            var e = $("#unitForm > .row > div:eq("+oldRowIndex+")").detach();
            if (newRowIndex == 0) {
                $("#unitForm > .row > div:eq("+newRowIndex+")").before(e);
            } else {
                $("#unitForm > .row > div:eq("+(newRowIndex-1)+")").after(e);
            }
            reorderUnitTitle();
        },
        dataLoaded: function(caller, records) {
            updateUnitTimeBar(records);
            initUnitTimeFieldEvent();
            initOutcomeTooltips();
        }
    });

    var exist_units = [];
    if ($("#courseId").val()) {
        $.get("db/unit_level.php",
            {get_units: $('#courseId').val()}
        ).done(function(data) {
            if (data.length) {
                exist_units = JSON.parse(data);
                $('#unit-sequence').appendGrid('load', exist_units);
                addUnits(1, exist_units.length);
                $.each(exist_units, function(index, value) {
                    $('#inputUnitTitle'+value.ordering).val(value.title);
                    syncInputFields($('#inputUnitTitle'+value.ordering), $('#unit-sequence_title_'+value.ordering));
                    $('#inputUnitPedagogicalApproach'+value.ordering).val(value.pedagogical_approach);
                    syncInputFields($('#inputUnitPedagogicalApproach'+value.ordering), $('#unit-sequence_pedagogical_approach_'+value.ordering));
                    $('#inputUnitDesc'+value.ordering).val(value.description);
                });
                allocateCourseObjLabels();
                $('input[id^="unit-sequence_lo"]').change(function() {
                    allocateCourseObjLabels();
                });
            }
        });
    }

    // get update course assignments on focus
    $("select[name^='outcomes_assessment_']").next().focus(function() {
        var assignment_ids = $("input[name^='assignments_id_']").val();
    });

    // change select color and update autocomplete
    $("select[name^='outcomes_type_']").change(function(){
        changeCourseObjColor($(this));
        initCourseObjAutocomp($(this));
    });

    // init other autocomplete
    initCourseSubjectAutocomp();
    initCourseClassSizeAutocomp();
    initCourseAssessAutocomp();
    initUnitPedagogicalApproachAutocomp();

    // init course resources file upload field
    $("#course_resources_uploader").fineUploader({
        template: 'qq-template-gallery',
        request: {
            endpoint: '../db/uploads.php'
        },
        thumbnails: {
            placeholders: {
                waitingPath: '/lds/fine-uploader/placeholders/waiting-generic.png',
                notAvailablePath: '/lds/fine-uploader/placeholders/not_available-generic.png'
            }
        },
        validation: {
            allowedExtensions: ['jpeg', 'jpg', 'txt', 'pdf', 'doc', 'ppt', 'xls', 'docx', 'pptx', 'xlsx'],
            itemLimit: 10,
            sizeLimit: 10485760
        }
    });

    // event to create interface in session level
    $("#selectNumSessions").change(function() {
        if ($("#session-tab").html().trim() == "") {
            createSessionTable();
        } else {
            updateSessionTable();
        }
    });

    $("[id^='unit-sequence_tc_'], [id^='unit-sequence_ts_']").change(function() {
        updateUnitTimeBar($('#unit-sequence').appendGrid('getAllValue'));
    });

    $('[data-toggle="tooltip"]').tooltip({
        placement: 'top',
        container: 'body'
    });

    // Pattern related events
    if ($("#courseId").val()) {
        $.get("db/unit_pattern.php",
            {get_unit_patterns: $('#courseId').val()}
        ).done(function(data) {
            if (data.length) {
                patterns = JSON.parse(data);
                updateUnitTimeNumber(patterns);
                updateUnitTimeBar($('#unit-sequence').appendGrid('getAllValue'));
            }
        });
    }

    $('.edit-pattern-btn').click(function() {
        var unitTitle = $(this).parents('.unit-container').find('h4').text();
        var unitNum = unitTitle.split(" ")[1];
        var patternTab = $(tabs).find('.ui-tabs-nav li[data-unitnum="'+unitNum+'"]');
        if (patternTab.length) {
            $(tabs).tabs('option', 'active', $(tabs).find('.ui-tabs-nav li').index(patternTab));
        } else {
            addPatternTab(unitNum);
        }
    });

    $('#load_patterns').click(function() {
        var pattern_id = $('#patterns_list').val();
        if (pattern_id) {
            $.get("db/pattern.php",
                {get_pattern: pattern_id}
            ).done(function(data) {
                if (data.length) {
                    pattern = JSON.parse(data);
                    //var a_num = Object.keys(pattern.activities).length;
                    alertify.confirm("Loading this pattern will remove all unsaved activity sequences in this unit, are you sure?", function () {
                        jsPlumbInstance.empty('canvas');
                        _loadFlowchart(pattern);
                    });
                }
            });
        }
    });

    /*
    $('#patterns_list').selectize({
        valueField: 'id',
        labelField: 'name',
        searchField: ['name', 'related'],
        create: false,
        preload: 'focus',
        render: {
            option: function(item, escape) {
                var label = item.name;
                var caption = item.related;
                return '<div>' +
                    '<span class="label">' + escape(label) + '</span>' +
                    '<span class="caption">' + escape(caption) + '</span>' +
                    '</div>';
            }
        },
        load: function(query, callback) {
            if (!query.length) return callback();
            $.ajax({
                url: 'db/pattern.php?get_all_patterns_select=1',
                type: 'GET',
                error: function() {
                    callback();
                },
                success: function(res) {
                    callback(res.patterns);
                }
            });
        }
    });
    */

    // Sessions level
    if ($("#courseId").val()) {
        $.get("db/sessions.php",
            {get_session_allocations: $('#courseId').val()}
        ).done(function(data) {
            if (data.length) {
                var obj = JSON.parse(data);
                if (obj.allocations.length) {
                    sessionDropHistory = updateSessionAllocations(obj.allocations, patterns);
                }
            }
        });
    }

    $("#tabs").on('tabsactivate', function(event, ui) {
        _saveActivity();
        _clearClickedWindow();
        if (ui.oldTab.hasClass('pattern-tab')) {
            var unitNum = ui.oldTab.attr('data-unitnum');
            var p = _saveFlowchartObj();
            delete patterns[unitNum];
            if (!jQuery.isEmptyObject(p)) {
                p.courseId = $('#courseId').val();
                patterns[unitNum] = p;
            }
        }

        if (ui.newTab.hasClass('pattern-tab')) {
            // wait until _clearActivity completed
            _clearActivity(function() {
                activities = {};
                jsPlumbInstance.empty('canvas');
                $("#activitySettingForm form").hide();
                $("#activitySettingForm").css('outline', 'none');
                $("#patternName").val();
                var unitNum = ui.newTab.attr('data-unitnum');
                if (patterns.hasOwnProperty(unitNum)) {
                    if (typeof patterns[unitNum].nodes != 'undefined') {
                        $("#patternName").val(patterns[unitNum].name);
                        _loadFlowchart(patterns[unitNum]);
                    }
                }
            });
        }

        if (ui.newTab.attr('aria-controls') == 'course-tab') {
            updateUnitTimeNumber(patterns);
            updateUnitTimeBar($('#unit-sequence').appendGrid('getAllValue'));
        }

        if (ui.newTab.attr('aria-controls') == 'unit-tab') {
            $.each(patterns, function(k, p) {
                var sourceIds = getOrderFromConnections(p.connections, 'source');
                var targetIds = getOrderFromConnections(p.connections, 'target');
                var properOrder = reorderConnections(sourceIds, targetIds, []);
                if (properOrder.length == 0) {
                    properOrder = _.pluck(p.nodes, 'elementId');
                }
                var previewDiv = $('.unit-container:eq('+(k-1)+') .previewUnitPattern');
                previewDiv.empty();
                $('<div></div>').addClass('previewUnitPatternDiv').appendTo(previewDiv);
                appendPreviewUnitDiv(p, k, properOrder, previewDiv.find('div.previewUnitPatternDiv'), 1);
            });
        }

        if (ui.newTab.attr('aria-controls') == 'session-tab') {
            $('.unit-draggable-container').empty();
            var unitInstance = [];
            $.each(patterns, function(k, p) {
                var sourceIds = getOrderFromConnections(p.connections, 'source');
                var targetIds = getOrderFromConnections(p.connections, 'target');
                var properOrder = reorderConnections(sourceIds, targetIds, []);
                if (properOrder.length == 0) {
                    properOrder = _.pluck(p.nodes, 'elementId');
                }
                var unitDragDiv = $('<div></div>').addClass('unit-drag-div').attr('data-unit', k);
                $('<div></div>').addClass('label label-default unit-title').attr('data-unit', k).text('Unit '+k).appendTo(unitDragDiv);
                $('<div></div>').addClass('dragUnitSessionDiv').appendTo(unitDragDiv);
                unitDragDiv.appendTo('.unit-draggable-container');

                appendPreviewUnitDiv(p, k, properOrder, $('.dragUnitSessionDiv:eq('+(k-1)+')'), 0);
                unitInstance.push(1);
            });

            $('.unit-drag-div').draggable({
                handle: ".unit-title",
                revert: "invalid",
                containment: "#session-tab",
                helper: "clone",
                opacity: 0.6
            });

            $('.dragUnitSessionDiv .label-activity').draggable({
                revert: "invalid",
                containment: "#session-tab",
                helper: "clone",
                opacity: 0.6
            });

            $("#session-droppable .session_detail > div").droppable({
                accept: ".unit-drag-div, .label-activity",
                classes: {
                    "ui-droppable-hover": "ui-state-highlight"
                },
                drop: function(e, ui) {
                    var dropAt = $(this).data('session');
                    var insertBefore = '';
                    $(this).children('a.label-activity, div.unit-drag-div').each(function() {
                        if ($(this).offset().top > ui.offset.top) {
                            insertBefore = $(this);
                            return false;
                        }
                    });

                    if (ui.draggable.hasClass('unit-drag-div')) {
                        var unit = ui.draggable.data('unit');
                        if (ui.draggable[0].parentElement.className == 'unit-draggable-container') {
                            var dropDiv = ui.draggable.clone();
                            $('<i></i>').addClass('fa fa-window-close delete-unit')
                            .attr({'aria-hidden':true, 'title':'Remove'})
                            .click(function() {
                                var uElement = $(this).parent();
                                alertify.confirm("Remove this unit?", function () {
                                    removeDroppedUnit(uElement);
                                });
                            }).insertBefore(dropDiv.find('.dragUnitSessionDiv'));
                        } else {
                            var dropDiv = ui.draggable;
                            sessionDropHistory = _.reject(sessionDropHistory, function(d) {
                                return (d.mode == 'full' && d.unit == unit);
                            });
                        }

                        dropDiv.draggable({
                            handle: ".unit-title",
                            revert: "invalid",
                            containment: "#session-droppable",
                            helper: "clone",
                            opacity: 0.6
                        });
                        if (insertBefore != '') {
                            dropDiv.insertBefore(insertBefore);
                        } else {
                            dropDiv.appendTo($(this));
                        }
                        sessionDropHistory.push({mode:'full', unit:unit, activity:0, dropAt:dropAt, instance:0});
                    } else {
                        var aUnit = ui.draggable.data('unit');
                        var aNum = ui.draggable.data('activity');

                        if (ui.draggable[0].parentElement.className == 'dragUnitSessionDiv') {
                            var dropDiv = ui.draggable.clone();
                            dropDiv.attr('data-instance', unitInstance[aUnit-1]);
                            // Remove activity icon
                            $('<i></i>').addClass('fa fa-window-close delete-activity')
                            .attr({'aria-hidden':true, 'title':'Remove'})
                            .click(function() {
                                var aElement = $(this).parent();
                                alertify.confirm("Remove this activity?", function () {
                                    removeDroppedActivity(aElement, unitInstance);
                                });
                            }).appendTo(dropDiv);

                            // Highlight all activities belongs to the same unit instance
                            dropDiv.mouseover(function() {
                                $('.session_detail a.label-activity[data-instance="'+$(this).data('instance')+'"][data-unit="'+aUnit+'"]').css('outline', '#FF0000 dashed 2px');
                            }).mouseout(function() {
                                $('.session_detail a.label-activity[data-instance="'+$(this).data('instance')+'"][data-unit="'+aUnit+'"]').css('outline-width', '0');
                            });

                            var aTotalNum = $('.unit-drag-div[data-unit="'+aUnit+'"] .dragUnitSessionDiv a').length-1;
                            sessionDropHistory.push({mode:'single', unit:aUnit, activity:aNum, dropAt:dropAt, instance:unitInstance[aUnit-1]});
                            var droppedActivites = _.where(sessionDropHistory, {mode:'single', unit:aUnit, instance:unitInstance[aUnit-1]});

                            if (aTotalNum == droppedActivites.length) {
                                ui.draggable.fadeTo('fast', 1).draggable("enable");
                                ui.draggable.siblings().each(function(index) {
                                    $(this).fadeTo('fast', 1).draggable().draggable("enable");
                                });
                                unitInstance[aUnit-1]++;
                            } else {
                                ui.draggable.fadeTo('fast', 0.4).draggable("disable");
                            }
                        } else {
                            var dropDiv = ui.draggable;
                            var existInstance = _.findWhere(sessionDropHistory, {mode:'single', unit:aUnit, activity:aNum}).instance;
                            sessionDropHistory = _.reject(sessionDropHistory, function(d) {
                                return (d.mode == 'single' && d.unit == aUnit && d.activity == aNum && d.instance == existInstance);
                            });
                            sessionDropHistory.push({mode:'single', unit:aUnit, activity:aNum, dropAt:dropAt, instance:existInstance});
                        }
                        dropDiv.draggable({
                            revert: "invalid",
                            containment: "#session-droppable",
                            helper: "clone",
                            opacity: 0.6
                        });

                        if (insertBefore != '') {
                            dropDiv.insertBefore(insertBefore);
                        } else {
                            dropDiv.appendTo($(this));
                        }
                    }
                    updateActivityOrders(dropAt);
                    //console.log(sessionDropHistory);
                }
            });
        }
    });

    var removeDroppedUnit = function(uElement) {
        var session = uElement.parent().data('session');
        var unit = uElement.data('unit');
        uElement.remove();
        sessionDropHistory = _.reject(sessionDropHistory, function(d) {
            return (d.mode == 'full' && d.unit == unit && d.dropAt == session);
        });
    }

    var removeDroppedActivity = function(aElement, unitInstance) {
        var session = aElement.parent().data('session');
        var unit = aElement.data('unit');
        var activity = aElement.data('activity');
        var instance = aElement.data('instance');
        var totalNum = $('div.unit-drag-div[data-unit="'+unit+'"] .dragUnitSessionDiv a.label-activity').length;
        var dropped = $('#session-droppable a.label-activity[data-unit="'+unit+'"][data-instance="'+instance+'"]').map(function() {
            return $(this).data('activity');
        }).get().sort();
        var currentInsance = unitInstance[unit-1];

        $('#session-droppable a.label-activity[data-unit="'+unit+'"][data-instance="'+instance+'"]').remove();
        sessionDropHistory = _.reject(sessionDropHistory, function(d) {
            return (d.mode == 'single' && d.unit == unit && d.instance == instance);
        });
        if (instance == currentInsance && dropped.length < totalNum) {
            $('div.unit-drag-div[data-unit="'+unit+'"] .dragUnitSessionDiv a.label-activity')
                .fadeTo('fast', 1).draggable().draggable("enable");
        }
    }
});

var updateActivityOrders = function(session) {
    $('div[data-session="'+session+'"]').children().each(function() {
        $(this).attr('data-order', $(this).index()+1);
    });
}

// Recurrsively order the boxes by the connections
var reorderConnections = function (sources, targets, order) {
    var remainSources = [];
    var remainTargets = [];

    $.each(sources, function(index, id) {
        if (order.length == 0) {
            order.push(id);
            order.push(targets[index]);
        } else {
            if (order.indexOf(id) != -1) {
                order.push(targets[index]);
            } else if (order.indexOf(targets[index]) != -1) {
                order.unshift(id);
            } else {
                remainSources.push(id);
                remainTargets.push(targets[index]);
            }
        }
    });
    if (remainSources.length == 0 && remainTargets.length == 0) {
        return order;
    } else {
        reorderConnections(remainSources, remainTargets, order);
    }
}

function initOutcomeTooltips(caller) {
    outcome_length = $('textarea[id^="outcomes_description_"]').length;
    $('td[id^="unit-sequence_lo"]').tooltip('destroy');
    for (var i=0; i<outcome_length; i++) {
        var type = $('#outcomes_type_'+(i+1)).val();
        var content = $("#outcomes_description_"+(i+1)).val();
        $('td[id="unit-sequence_lo'+(i+1)+'_td_head"]').tooltip({
            placement: 'auto',
            container: 'body',
            template: '<div class="tooltip tooltip-'+type+'" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
            title: content
        });
    }
}

function changeOutcomeTooltips(id) {
    var num = id.split("_").pop();
    var type = $('#outcomes_type_'+num).val();
    var content = $("#outcomes_description_"+num).val();
    $('td[id="unit-sequence_lo'+num+'_td_head"]').tooltip('destroy').tooltip({
        placement: 'auto',
        container: 'body',
        template: '<div class="tooltip tooltip-'+type+'" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        title: content
    });
}

function updateSessionAllocations(allocations, patterns) {
    var sessionDropHistory = _.map(allocations, function(a) {
        return {
            'activity': parseInt(a['activity']),
            'dropAt': parseInt(a['session']),
            'instance': parseInt(a['instance']),
            'mode': a['mode'],
            'unit': parseInt(a['unit'])
        };
    });

    var delete_icon = $('<i></i>').addClass('fa fa-window-close delete-unit')
        .attr({'aria-hidden': 'true', 'title': 'Remove'});

    $.each(_.sortBy(allocations, 'ordering'), function(k, v) {
        if (v['mode'] == 'full') {
            var unit_label = $('<div></div>').addClass('label label-default unit-title ui-draggable-handle')
                .attr('data-unit', v['unit']).text('Unit '+v['unit']);
            var delete_unit_icon = delete_icon.clone().click(function() {
                var uElement = $(this).parent();
                alertify.confirm("Remove this unit?", function () {
                    var session = uElement.parent().data('session');
                    var unit = uElement.data('unit');
                    uElement.remove();
                    sessionDropHistory = _.reject(sessionDropHistory, function(d) {
                        return (d.mode == 'full' && d.unit == unit && d.dropAt == session);
                    });
                });
            })
            var drag_unit_div = $('<div></div>').addClass('dragUnitSessionDiv');
            $.each(patterns[v['unit']]['nodes'], function(kk, vv) {
                $('<a></a>').addClass('label-activity '+vv['subType']+' ui-draggable ui-draggable-handle')
                    .attr({'data-unit':v['unit'], 'data-activity':v['activity']})
                    .text(typeFullNames[vv['subType']])
                    .appendTo(drag_unit_div);
            });
            $('<div></div>').addClass('unit-drag-div ui-draggable')
                .attr({'data-unit': v['unit'], 'data-order': v['ordering']})
                .append(unit_label, delete_unit_icon, drag_unit_div)
                .appendTo($('.session_detail > div[data-session="'+v['session']+'"]'));
        } else {
            var a = patterns[v['unit']]['nodes'][v['activity']-1];
            var delete_unit_icon = delete_icon.clone().click(function() {
                var uElement = $(this).parent();
                alertify.confirm("Remove this unit?", function () {
                    var session = uElement.parent().data('session');
                    var unit = uElement.data('unit');
                    uElement.remove();
                    sessionDropHistory = _.reject(sessionDropHistory, function(d) {
                        return (d.mode == 'full' && d.unit == unit && d.dropAt == session);
                    });
                });
            });
            $('<a></a>').addClass('label-activity '+a['subType']+' ui-draggable ui-draggable-handle')
                .attr({
                    'data-unit':v['unit'],
                    'data-activity':v['activity'],
                    'data-instance':v['instance'],
                    'data-order':v['ordering'],
                    'title': 'Unit '+v['unit']
                })
                .text(typeFullNames[a['subType']])
                .append(delete_unit_icon)
                .appendTo($('.session_detail > div[data-session="'+v['session']+'"]'))
                .draggable({
                    revert: "invalid",
                    containment: "#session-tab",
                    helper: "clone",
                    opacity: 0.6
                }).mouseover(function() {
                    $('.session_detail a.label-activity[data-instance="'+v['instance']+'"][data-unit="'+v['unit']+'"]').css('outline', '#FF0000 dashed 2px');
                }).mouseout(function() {
                    $('.session_detail a.label-activity[data-instance="'+v['instance']+'"][data-unit="'+v['unit']+'"]').css('outline-width', '0');
                });;
        }
    });

    return sessionDropHistory;
}

function updateUnitTimeNumber(patterns) {
    var tcOptions = ['f2fs', 'f2fc', 'f2ffw'];
    var tsOptions = ['informal', 'onlinea', 'onlines'];
    $.each(patterns, function(k, p) {
        var tc = _.reduce(_.map(p.activities, function(a) {
            if (tcOptions.indexOf(a.setting) > -1) {
                return parseInt(a.duration);
            } else {
                return 0;
            }
        }), function(m, n) {
            return m+n;
        }, 0);
        var ts = _.reduce(_.map(p.activities, function(a) {
            if (tsOptions.indexOf(a.setting) > -1) {
                return parseInt(a.duration);
            } else {
                return 0;
            }
        }), function(m, n) {
            return m+n;
        }, 0);
        $('#unit-sequence_tc_'+k).val(tc);
        $('#unit-sequence_ts_'+k).val(ts);
    });
}

function getOrderFromConnections(connections, type) {
    var position = '';
    if (type == "source") {
        position = "Bottom";
    } else {
        position = "Top";
    }
    return _.map(connections, function(conn) {
        return 'flowchart'+conn[type+'UUId'].replace(position+'Center', '');
    });
}

function appendPreviewUnitDiv(p, unit, properOrder, divAppendTo, havePopOver) {
    $.each(properOrder, function(kk, eid) {
        var type = p.activities[eid]['type'];
        var assessment = 'Yes';
        // social
        if (p.activities[eid]['assessment'] == '0') assessment = 'No';
        var social = socialNames[p.activities[eid]['social']];
        // feedback
        var feedback = _.map(p.activities[eid]['feedback'], function(f) {return feedbackNames[f];}).join(', ');

        var motivator = _.map(p.activities[eid]['motivator'], function(m) {return motivatorNames[m];}).join(', ');
        var duration = p.activities[eid]['duration']+' minutes';
        var setting = settingNames[p.activities[eid]['setting']];
        var resource = _.map(p.activities[eid]['resources'], function(r) {return resourceNames[r];}).join(', ');
        var tool = _.map(p.activities[eid]['tools'], function(t) {return toolNames[t];}).join(', ');
        var note = p.activities[eid]['notes'];

        var aDiv = $('<a></a>').addClass('label-activity '+type).attr({
            'data-unit': unit,
            'data-activity': kk+1,
            'title': 'Unit '+unit
        }).text(typeFullNames[type]);

        if (havePopOver) {
            var html = '<div class="popover-activity-content">';
            html += popoverField('fa-file-text-o', p.activities[eid]['description']);
            html += popoverField('icon-grading', assessment);
            html += popoverField('fa-users', social);
            html += popoverField('fa-commenting-o', feedback);
            html += popoverField('fa-bolt', motivator);
            html += popoverField('fa-clock-o', duration);
            html += popoverField('fa-link', setting);
            html += popoverField('fa-archive', resource);
            html += popoverField('fa-wrench', tool);
            html += popoverField('fa-sticky-note-o', note);
            html += '</div>';
            aDiv.attr('role', 'button');
            aDiv.attr('tabindex', 0);
            aDiv.popover({
                title: typeFullNames[type],
                content: html,
                html: true,
                trigger: 'focus',
                container: 'body',
                placement: 'auto right'
            });
        }

        divAppendTo.append(aDiv);
    });
}

function popoverField(icon, field) {
    var html = '<div>';
    html += '<i class="fa '+icon+'" aria-hidden="true"></i>';
    html += '<div class="popover-activity-field">'+field+'</div>';
    html += '</div>';
    return html;
}

function saveSessionLevel() {
    var droppedUnits = $('#session-droppable .session_detail .ui-droppable > .unit-drag-div');
    var droppedActivites = $('#session-droppable .session_detail .ui-droppable > a.label-activity');

    var sessions = []
    $('input[id^="inputSessionTitle"]').each(function(){
        sessions.push($(this).val());
    });

    var units = [];
    droppedUnits.each(function(){
        units.push({
            'session': $(this).parent().data('session'),
            'unit': $(this).data('unit'),
            'ordering': $(this).data('order')
        });
    });

    var activities = [];
    droppedActivites.each(function(){
        activities.push({
            'session': $(this).parent().data('session'),
            'unit': $(this).data('unit'),
            'activity': $(this).data('activity'),
            'instance': $(this).data('instance'),
            'ordering': $(this).data('order')
        });
    });

    var csrf = $('#session_csrf').val();
    var course_id = $('#courseId').val();

    var all_sessions_detail = {'course_id':course_id, 'session_csrf':csrf, 'sessions':sessions, 'units':units, 'activities':activities};

    $.ajax({
        type: "POST",
        url: "db/sessions.php",
        data: all_sessions_detail,
        dataType: "json",
        success: function(data) {
            $.get("token.php?mode=session", function(data) {
                $("#session_csrf").val(data);
            });
        },
        error: function() {
            $.get("token.php?mode=session", function(data) {
                $("#session_csrf").val(data);
            });
            alertify.error("Error submitting the form.");
        }
    });
}

function saveUnitPatterns(patterns) {
    if (typeof patterns != 'undefined') {
        // save the pattern to object once more if the active tab is the pattern edtitor
        var activeIndex = $(tabs).tabs('option', 'active');
        if (activeIndex > 2) {
            var unitNum = $(tabs).find('.ui-tabs-nav li').eq(activeIndex).attr('data-unitnum');
            var p = _saveFlowchartObj();
            //if (!jQuery.isEmptyObject(p)) {
                p.courseId = $('#courseId').val();
                p.name = $('#patternName').val();
                patterns[unitNum] = p;
            //}
        }
        if (!patterns[1].hasOwnProperty('pattern_csrf')) {
            patterns[1]['pattern_csrf'] = $("#pattern_csrf").val();
        }
        
        if (!jQuery.isEmptyObject(patterns)) {
            $.ajax({
                type: "POST",
                url: "db/unit_pattern.php",
                data: patterns,
                dataType: "json",
                success: function(data) {
                    alertify.success(data['message']);
                    $.get("token.php?mode=pattern", function(data) {
                        $("#pattern_csrf").val(data);
                    });
                    saveSessionLevel();
                },
                error: function() {
                    $.get("token.php?mode=pattern", function(data) {
                        $("#pattern_csrf").val(data);
                    });
                    alertify.error("Error submitting the form.");
                }
            });
        }
    }
}

function addPatternTab(unitNum) {
    var tabTemplate = '<li class="pattern-tab" data-unitnum="#{unitNum}"><a href="#{href}">#{label}</a> <span class="ui-icon ui-icon-close" role="presentation">Remove Tab</span></li>';
    var label = 'Unit '+unitNum+' Pattern';
    var id = unitNum+'-pattern-tab';
    var li = $(tabTemplate.replace(/#\{href\}/g, '#pattern-tab').replace( /#\{label\}/g, label).replace( /#\{unitNum\}/g, unitNum));

    $(tabs).find('.ui-tabs-nav').append(li);
    $(tabs).tabs('refresh');
    $(tabs).tabs('option', 'active', $(tabs).find('.ui-tabs-nav li').length-1);

    // Close icon: removing the tab on click
    $(tabs).find('.ui-tabs-nav li[data-unitnum="'+unitNum+'"]').on( "click", "span.ui-icon-close", function() {
      var panelId = $(this).closest("li").remove().attr("aria-controls");
      $("#pattern-tab").hide();
      $(tabs).tabs("refresh");
      $(tabs).tabs('option', 'active', 1);
    });
}

function changeCourseObjColor(obj) {
    switch (obj.val()) {
        case "d_knowledge":
            obj.css("background-color", "lightpink");
            obj.css("color", "red");
            break;
        case "d_skills":
            obj.css("background-color", "lightblue");
            obj.css("color", "blue");
            break;
        case "g_skills":
            obj.css("background-color", "lightgreen");
            obj.css("color", "green");
            break;
    }
}

function initCourseSubjectAutocomp() {
    // strings for autocomplete
    var subject = [
        "e-Leadership",
        "e-Learning",
        "Learning technology design"
    ];

    $("#inputSubject").autocomplete({
        source: subject,
        minLength: 0
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });
}

function initCourseObjAutocomp(obj) {
    // strings for autocomplete
    var d_knowledge = [];
    var d_skills = [];
    var g_skills = [
        "Communication skills",
        "Collaboration skills",
        "Critical thinking",
        "Creativity",
        "Leadership",
        "Self-directed learning",
        "Time management"
    ];

    var var_index = obj.attr('name').split('_')[2]; // field name = outcomes_description_X

    $("textarea[name='outcomes_description_"+var_index+"']").autocomplete({
        source: function(request, response) {
            //response(getUnusedAutoComplete("textarea[name^='outcomes_description_']", eval(obj.val())));
            response($.ui.autocomplete.filter(g_skills, request.term.split( /,\s*/ ).pop()));
        },
        select: function(event, ui) {
            var terms = this.value.split( /,\s*/ );;
            terms.pop();
            terms.push( ui.item.value );
            terms.push( "" );
            this.value = terms.join( ", " );
            return false;
        },
        minLength: 0
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });
}

function initCourseAssessAutocomp() {
    // strings for autocomplete
    var assessment = [
        "System shows the right answer",
        "Automatic grading",
        "Comment from peers",
        "Grading by the teacher",
        "Written comments by the teacher",
        "Oral comments by the teacher"
    ];

    $("input[name='cgo_assess[]']").autocomplete({
        source: assessment,
        minLength: 0
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });
}

function initAssignmentIdAutocomp() {
    // strings for autocomplete
    var id = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2", "D3"];

    $("input[name^='assignments_id_']").autocomplete({
        source: function(request, response) {
            response(getUnusedAutoComplete("input[name^='assignments_id_']", id));
        },
        minLength: 0
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });
}

function initAssignmentDescAutocomp() {
    var desc = ["Reading summary", "Wiki", "Presentation", "Concept map", "Written assignment"];

    $("input[name^='assignments_description_']").autocomplete({
        source: desc,
        minLength: 0
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });
}

function initUnitPedagogicalApproachAutocomp() {
    var approaches = ['Project-based learning', 'Self-directed learning', 'Inquiry-based learning', 'Problem-based learning'];

    $("input[name^='inputUnitPedagogicalApproach'], input[name^='unit-sequence_pedagogical_approach_']").autocomplete({
        source: approaches,
        minLength: 0
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });
}

function initCourseClassSizeAutocomp() {
    var class_size = ['10', '20', '30', '40', '50', '100', '200', '500', '800', '1000'];

    $("#inputClassSize").autocomplete({
        source: class_size,
        minLength: 0
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });
}

// Create an empty session table
function createSessionTable() {
    var sessions = parseInt($("#selectNumSessions").val());
    var template = _.template(
        '<table id="session-droppable" class="table table-bordered">' +
        '<thead>' +
        '<tr>' +
        '<th class="session_title">Sessions</th>' +
        '<th>Allocation of Units</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' +
        '<% for(var j = 0; j < sessions; j++) { %>' +
        '<tr>' +
        '<td>' +
        '<h4><%= j+1 %></h4>' +
        '<div class="form-group">' +
        '<div class="col-sm-12">' +
        '<input type="text" class="form-control" id="inputSessionTitle<%= j+1 %>" name="inputSessionTitle<%= j+1 %>" placeholder="Session Title">' +
        '</div>' +
        '</div>' +
        '</td>' +
        '<% for(var i = 0; i < units; i++) { %>' +
        '<td><div data-session="<%= j+1 %>"></div></td>' +
        '<% } %>' +
        '</tr>' +
        '<% } %>' +
        '</tbody>' +
        '</table>'
    );

    content = template({
        units: units,
        sessions: sessions
    });
    $("#session-tab").append(content);
}

function updateSessionTable() {
    var sessions = parseInt($("#selectNumSessions").val());
    var sessions_exist = $("#session-droppable > tbody > tr").length;
    var template = _.template(
        '<tr>' +
        '<td>' +
        '<h4><%= session_index %></h4>' +
        '<div class="form-group">' +
        '<div class="col-sm-12">' +
        '<input type="text" class="form-control" id="inputSessionTitle<%= session_index %>" name="inputSessionTitle<%= session_index %>" placeholder="Session Title">' +
        '</div>' +
        '</div>' +
        '</td>' +
        '<td class="session_detail"><div data-session="<%= session_index %>"></div></td>' +
        '</tr>'
    );

    if (sessions > sessions_exist) {
        _(sessions - sessions_exist).times(function(n) {
            var session_index = sessions_exist + n + 1;
            content = template({
                session_index: session_index
            });
            $("#session-droppable").find('tr').eq(-1).after(content);
        });
    } else if (sessions_exist > sessions) {
        _(sessions_exist - sessions).times(function(n) {
            $("#session-droppable").find('tr').eq(-1).remove();
        });
    }
}

function areUnitsFilled(start, num) {
    for (var i = num + 1; i < start; i++) {
        var title = $("#inputUnitTitle" + i).val();
        var desc = $("#inputUnitDesc" + i).val();
        if (title.trim() != "" || desc.trim() != "") return true;
    }
    return false;
}

function addUnits(start, num) {
    var unitTemplate = _.template(
        '<% for(var i = start+1; i <= num; i++) { %>' +
        '<div class="col-md-4">' +
            '<div class="unit-container well">' +
                '<h4>Units <%= i %></h4>' +
                '<div class="form-group">' +
                    '<div class="col-sm-12">' +
                        '<input type="text" class="form-control" id="inputUnitTitle<%= i %>" name="inputUnitTitle<%= i %>" placeholder="Title">' +
                    '</div>' +
                '</div>' +
                '<div class="form-group">' +
                    '<div class="col-sm-12">' +
                        '<input type="text" class="form-control" id="inputUnitPedagogicalApproach<%= i %>" name="inputUnitPedagogicalApproach<%= i %>" placeholder="Pedagogical Approach">' +
                    '</div>' +
                '</div>' +
                '<div class="form-group">' +
                    '<div class="col-sm-12">' +
                        '<textarea class="form-control" id="inputUnitDesc<%= i %>" name="inputUnitDesc<%= i %>" placeholder="Description" rows="3"></textarea>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group">' +
                    '<div class="col-sm-12 unit-objectives">'+
                        //'<select class="form-control" id="selectUnitObj<%= i %>" name="selectUnitObj<%= i %>">'+
                        //    '<optgroup label="Disciplinary Knowledge"></optgroup>'+
                        //    '<optgroup label="Disciplinary Skills"></optgroup>'+
                        //    '<optgroup label="Generic Skills"></optgroup>'+
                        //'</select>'+
                    '</div>' +
                '</div>' +
                '<div class="form-group">' +
                    '<div class="col-sm-12">' +
                        '<a class="btn btn-primary edit-pattern-btn">' +
                            '<i class="fa fa-pencil" aria-hidden="true"></i> Edit learning pattern' +
                        '</a>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group">' +
                    '<div class="col-sm-12">' +
                        '<div class="previewUnitPattern"><p>No pattern for preview yet</p></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<% } %>'
    );

    content = unitTemplate({
        start: start,
        num: num,
        co_optgroups,
        co_optgroups
    });

    var newUnit = $(content).appendTo("#unitForm .row");
    //$("#unitForm .row").append(content);

    initUnitPedagogicalApproachAutocomp();

    // add event after DOM creation
    $(newUnit).find('input[id^="inputUnitTitle"]').change(function() {
        var val = $(this).val();
        var index = parseInt($(this).attr("id").replace("inputUnitTitle", ""));
        $("#session-droppable").find('tr').find('th').eq(index).html(val);
    });

    $(newUnit).find('.edit-pattern-btn').click(function() {
        var unitTitle = $(this).parents('.unit-container').find('h4').text();
        var unitNum = unitTitle.split(" ")[1];
        var patternTab = $(tabs).find('.ui-tabs-nav li[data-unitnum="'+unitNum+'"]');
        if (patternTab.length) {
            $(tabs).tabs('option', 'active', $(tabs).find('.ui-tabs-nav li').index(patternTab));
        } else {
            addPatternTab(unitNum);
        }
    });

    for(var i = start+1; i <= num; i++) {
        updateObjLabels(i);
    }
}

// Given a number of units to keep, delete others units
function delUnits(num) {
    $(".unit-container").slice(num).remove();
}

function updateObjLabels(unitNum) {
    objectiveLabels = [];
    var all_type = $("select[name^='outcomes_type_']");
    var all_desc = $("textarea[name^='outcomes_description_']");
    all_type.each(function(index) {
        var oType = $(this).val();
        var oDesc = $("textarea[name='outcomes_description_"+(index+1)+"']").val();
        if (oType == 0) {
            labelClass = 'default';
        } else {
            labelClass = oType;
        }
        if (oType.trim() != "") {
            var oDiv = $('<div>', {
                'class': 'label bg-'+labelClass,
                'text': '[LO'+(index+1)+'] '+objective_str[oType],
                'data-toggle': 'tooltip',
                'title': oDesc
            });
            objectiveLabels.push(oDiv);
        }
    });

    /*
    var all_type = $("select[name^='outcomes_type_']");
    var selectize_options = {
        persist: false,
        maxItems: null,
        valueField: 'outcomeNum',
        labelField: 'description',
        searchField: ['description', 'outcomeType'],
        optgroupField: 'outcomeType',
        optgroups: co_optgroups,
        optgroupLabelField: 'label',
        optgroupValueField: 'value'
    }

    if (unitNum !== undefined) {
        var select = $('#selectUnitObj'+unitNum);
        if (typeof select[0].selectize != 'undefined') select[0].selectize.destroy();
        select.selectize(selectize_options);

        var selectize = select[0].selectize;
        selectize.clear();
        selectize.clearOptions();
        all_type.each(function(ii) {
            var oType = $(this).val();
            var oDesc = $("textarea[name='outcomes_description_"+(ii+1)+"']").val();
            if (oType.trim() != "") {
                selectize.addOption({outcomeNum:ii+1, description:oDesc, outcomeType:oType});
            }
        });
    } else {
        $('select[id^="selectUnitObj"]').each(function(i) {
            if (typeof $(this)[0].selectize != 'undefined') $(this)[0].selectize.destroy();
            $(this).selectize(selectize_options);

            var selectize = $(this)[0].selectize;
            selectize.clear();
            selectize.clearOptions();
            all_type.each(function(ii) {
                var oType = $(this).val();
                var oDesc = $("textarea[name='outcomes_description_"+(ii+1)+"']").val();
                if (oType.trim() != "") {
                    selectize.addOption({outcomeNum:ii+1, description:oDesc, outcomeType:oType});
                }
            });
        });
    }
    */
}

function allocateCourseObjLabels(fieldNameNum) {
    if (fieldNameNum !== undefined) {
        // only update this unit
        var unitContainer = $("#inputUnitTitle"+fieldNameNum).parents(".unit-container");
        unitContainer.find('.unit-objectives').empty();
        var checkedArr = getOutcomeChecked(fieldNameNum);
        $.each(objectiveLabels, function(divIndex, div) {
            if (checkedArr[divIndex] == 1) {
                unitContainer.find('.unit-objectives').append(div.clone());
            }
        });
        /*
        var checkedArr = getOutcomeChecked(i+1);
        var select = $('#selectUnitObj'+fieldNameNum);
        $.each(checkedArr, function(index, value) {
            if (value == 1) {
                select[0].selectize.addItem(index, true);
            }
        });
        */
    } else {
        $(".unit-container").each(function(ucIndex) {
            var thisContainer = $(this);
            thisContainer.find('.unit-objectives').empty();
            var checkedArr = getOutcomeChecked(ucIndex+1);
            $.each(objectiveLabels, function(divIndex, div) {
                if (checkedArr[divIndex] == 1) {
                    thisContainer.find('.unit-objectives').append(div.clone());
                }
            });
        });
        /*
        $('select[id^="selectUnitObj"]').each(function(i) {
            var checkedArr = getOutcomeChecked(i+1);
            var select = $(this);
            $.each(checkedArr, function(index, value) {
                if (value == 1) {
                    select[0].selectize.addItem(index+1, true);
                }
            });
        });
        */
    }

    $('[data-toggle="tooltip"]').tooltip({
        placement: 'bottom',
        container: 'body'
    });
}

function updateUnitTimeBar(records) {
    // Type bar
    var tsTotal = sumUnitTime('ts', records);
    var tcTotal = sumUnitTime('tc', records);
    var tsPercent = (tsTotal/(tsTotal+tcTotal))*100;
    var tcPercent = (tcTotal/(tsTotal+tcTotal))*100;
    $('.progress .progress-bar-ts').css('width', tsPercent+'%').html("T-s: "+Math.round(tsPercent)+"%");
    $('.progress .progress-bar-tc').css('width', tcPercent+'%').html("T-c: "+Math.round(tcPercent)+"%");
    // Unit bar
    var total = tcTotal + tsTotal;
    $("#time-unit-bar").empty();
    $.each(records, function(index, value) {
        var unitTime = parseInt(value['tc']) + parseInt(value['ts']);
        var unitTimePercent = (unitTime/total)*100;
        if (index%2 == 0) {
            var barClass = 'progress-bar-unit-even';
        } else {
            var barClass = 'progress-bar-unit-odd';
        }
        $('<div></div>').attr('class', 'progress-bar '+barClass)
        .text(index+1)
        .css('width', unitTimePercent+'%')
        .appendTo("#time-unit-bar");
    });
}

function initUnitTimeFieldEvent() {
    $("[id^='unit-sequence_tc_'], [id^='unit-sequence_ts_']").off("change");
    $("[id^='unit-sequence_tc_'], [id^='unit-sequence_ts_']").change(function() {
        updateUnitTimeBar($('#unit-sequence').appendGrid('getAllValue'));
    });
}

////// Helper functions //////
function getUnusedAutoComplete(selector, list) {
    var existValues = $(selector).map(function(idx, elem) {
        if ($(elem).val().trim() != "") return $(elem).val();
    }).get();

    var unused = list.filter(function(val) {
        return existValues.indexOf(val) == -1;
    });
    return unused;
}

function syncInputFields(field1, field2) {
    field1.off('change');
    field2.off('change');
    field1.on('autocompletechange change', function() {
        //console.log($(this).attr("id")+' changed, value: '+field1.val());
        field2.val($(this).val());
    });
    field2.on('autocompletechange change', function() {
        //console.log($(this).attr("id")+' changed, value: '+field2.val());
        field1.val($(this).val());
    });
}

function reorderUnitTitle() {
    $(".unit-container").each(function(index) {
        $(this).find("h4").html('Unit '+ (index+1));
    });
}

function sumUnitTime(type, records) {
    var total = _.map(records, function(obj) {
        if (obj[type] == '') obj[type] = 0;
        return parseInt(obj[type]);
    }).reduce(function(acc, val) {
        return acc + val;
    }, 0);
    return total;
}

function getOutcomeChecked(fieldIndex) {
    var loNum = 1;
    var checkedArr = [];
    while ($("#unit-sequence_lo"+loNum+"_"+fieldIndex).length) {
        checkedArr.push(+$("#unit-sequence_lo"+loNum+"_"+fieldIndex).is(':checked'));
        loNum++;
    }
    return checkedArr;
}
