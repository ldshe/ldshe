var typeColors = {
    reflective: "#a020f0",
    productive: "#efcc00",
    exploratory: "#1cac78",
    directed: "#86c6da"
};
var typeShadeColors = {
    r1: '#d090f8', r2: '#ac3cf2', r3: '#52097f',
    c1: '#efcc00', c2: '#ffeb78', c3: '#d1b300',
    e1: '#7ae9c1', e2: '#21cd8f', e3: '#0e563c',
    d1: '#c3e3ed', d2: '#95cddf', d3: '#297187'
};
var typeFullNames = {
    r1: 'Revision', r2: 'Reflection', r3: 'Self-/Peer-assessment',
    c1: 'Construction: Conceptual/Visual Artefacts', c2: 'Construction: Tangible/Manipulable Artifacts', c3: 'Presentations, Performance Illustrations',
    e1: 'Tangible/Immersive Investigation', e2: 'Explorations through Conversation', e3: 'Information Exploration',
    d1: 'Test/Assessment', d2: 'Practice', d3: 'Receiving & Interpreting Information'
};
var reflectiveTypes = [
    {class: 'reflective', value: 'r1', name: 'Revision'},
    {class: 'reflective', value: 'r2', name: 'Reflection'},
    {class: 'reflective', value: 'r3', name: 'Self-/Peer-assessment'}
];
var productiveTypes = [
    {class: 'productive', value: 'c1', name: 'Construction: Conceptual/Visual Artefacts'},
    {class: 'productive', value: 'c2', name: 'Construction: Tangible/Manipulable Artifacts'},
    {class: 'productive', value: 'c3', name: 'Presentations, Performance Illustrations'}
];
var exploratoryTypes = [
    {class: 'exploratory', value: 'e1', name: 'Tangible/Immersive Investigation'},
    {class: 'exploratory', value: 'e2', name: 'Explorations through Conversation'},
    {class: 'exploratory', value: 'e3', name: 'Information Exploration'}
];
var directedTypes = [
    {class: 'directed', value: 'd1', name: 'Test/Assessment'},
    {class: 'directed', value: 'd2', name: 'Practice'},
    {class: 'directed', value: 'd3', name: 'Receiving & Interpreting Information'}
];
var socialNames = {
    group: 'Group',
    individual: 'Individual',
    peer: 'Peer-review',
    class: 'Class'
};
var feedbackNames = {
    auto: 'Automated Feedback',
    group: 'Group Feedback',
    indiv: 'Individual Feedback',
    peer: 'Peer-review/Feedback',
    score: 'Score'
};
var motivatorNames = {
    badges: 'Badges',
    leaderboard: 'Leaderboard',
    p_competition: 'Peer Competition',
    p_response: 'Peer Response (Quantity and Quality)',
    score: 'Score',
    team_agency: 'Team Agency',
    indiv_agency: 'Individual Agency',
    extra: 'Extra Activities'
};
var settingNames = {
    f2fs: 'Face-to-face (Synchronous)',
    f2fc: 'Face-to-face (Classroom)',
    f2ffw: 'Face-to-face (Field Work)',
    informal: 'Informal (On or Offline)',
    onlinea: 'Online (Asynchronous)',
    onlines: 'Online (Synchronous)'
}
var resourceNames = {
    r1: 'Additional Examples', r2: 'Assessment Rubric', r3: 'Audio', r4: 'Book',
    r5: 'Book Chapter', r6: 'Checklist', r7: 'Course/Session Outline', r23: 'Demo Video',
    r24: 'Interactive Learning Material',
    r8: 'Lecture Text', r9: 'Lecture Video', r10: 'Paper', r11: 'PPT Slides', r12: 'Quiz',
    r13: 'Sample Work by Students', r14: 'Survey', r15: 'Task Example', r16: 'Template',
    r17: 'Tutorial Text', r18: 'Tutorial Video', r19: 'Video', r20: 'Website',
    r21: 'Worksheet', r22: 'Writing Template'
};
var toolNames = {
    t1: 'Blog', t2: 'Brainstorming Tool', t3: 'Chatroom', t4: 'Discussion Forum',
    t5: 'e-Portfolio', t6: 'LMS-Moodle', t7: 'Mind-mapping Tool', t8: 'Online Assign Submission',
    t9: 'Online Shared Drive', t10: 'Online Shared Workspace', t11: 'Programming Language', t12: 'Quiz Tool',
    t13: 'Survey Tool', t14: 'Survey-Poll', t15: 'Video Quiz', t16: 'Wiki'
};
var activities = {};
var endpointList = [];
var sourcepointList = [];
var elementList = [];
var _saveFlowchart, elementCount = 0;
var jsPlumbInstance; //the jsPlumb jsPlumbInstance
var properties = [];
jsPlumb.ready(function () {
    var element = "";
    var clicked = false;

    jsPlumbInstance = window.jsp = jsPlumb.getInstance({
        // default drag options
        DragOptions: {
            cursor: 'pointer',
            zIndex: 2000
        },
        //the arrow overlay for the connection
        ConnectionOverlays: [
            ["PlainArrow", {
                width: 15,
                length: 15,
                location: 1,
                visible: true,
                id: "ARROW"
            }]
        ],
        Container: "canvas"
    });

    //define basic connection type
    var basicType = {
        connector: "StateMachine",
        paintStyle: {strokeStyle:"#216477", lineWidth: 4},
        hoverPaintStyle: {strokeStyle: "blue"}
    };
    jsPlumbInstance.registerConnectionType("basic", basicType);

    //style for the connector
    var connectorPaintStyle = {
            stroke: "#111",
            strokeWidth: 2
        },
    //style for the connector hover
        connectorHoverStyle = {
            stroke: "#216477",
            strokeWidth: 2
        },
        endpointHoverStyle = {
            fill: "#216477",
            stroke: "#216477"
        },

    //the source endpoint definition from which a connection can be started
        sourceEndpoint = {
            endpoint: "Dot",
            paintStyle: {fill: "#666", radius: 7},
            isSource: true,
            connector: ["Flowchart", {stub: 0, gap: 5, cornerRadius: 5, alwaysRespectStubs: true}],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            EndpointOverlays: [],
            maxConnections: 1,
            dragOptions: {},
            connectorOverlays: [
                ["Arrow", {
                    location: 1,
                    visible: true,
                    id: "ARROW",
                    direction: 1
                }]
            ]
        },

    //definition of the target endpoint the connector would end
        targetEndpoint = {
            endpoint: "Dot",
            paintStyle: {fill: "#7AB02C", radius: 7},
            maxConnections: 1,
            dropOptions: {hoverClass: "hover", activeClass: "active"},
            hoverPaintStyle: endpointHoverStyle,
            isTarget: true
        };

    //add the endpoints for the elements
    var ep;
    var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
        for (var i = 0; i < sourceAnchors.length; i++) {
            var sourceUUID = toId + sourceAnchors[i];
            ep = jsPlumbInstance.addEndpoint("flowchart" + toId, sourceEndpoint, {
                anchor: sourceAnchors[i], uuid: sourceUUID
            });
            sourcepointList.push(["flowchart" + toId, ep]);
            ep.canvas.setAttribute("title", "Drag a connection from here");
            ep = null;
        }
        for (var j = 0; j < targetAnchors.length; j++) {
            var targetUUID = toId + targetAnchors[j];
            ep = jsPlumbInstance.addEndpoint("flowchart" + toId, targetEndpoint, {
                anchor: targetAnchors[j], uuid: targetUUID
            });
            endpointList.push(["flowchart" + toId, ep]);
            ep.canvas.setAttribute("title", "Drop a connection here");
            ep = null;
        }
    };

    //load properties of a given element
    function loadProperties(clsName, left, top, label, startpoints, endpoints, datatype) {
        properties = [];
        properties.push({
            left: left,
            top: top,
            clsName: clsName,
            label: label,
            startpoints: startpoints,
            endpoints: endpoints,
            datatype: datatype
        });
    }

    //take the x, y coordinates of the current mouse position
    var x, y, offsetX, offsetY;
    var shapeHalfWidth = $("#reflectiveEv").width()/2;
    var shapeHalfHeight = $("#reflectiveEv").height()/2;
    $(document).on("mousemove", function (event) {
        x = event.pageX;
        y = event.pageY;
        diagramOffset = $("#myDiagram .jtk-demo-canvas").offset();
        offsetX = diagramOffset.left + shapeHalfWidth;
        offsetY = diagramOffset.top + shapeHalfHeight;
        if (clicked) {
            //console.log(diagramOffset.left+", "+x_left);
            properties[0].top = y - offsetY;
            properties[0].left = x - offsetX;
        }

    });

    //create an element to be drawn on the canvas
    function createElement(id) {
        var elm = $('<div>').addClass(properties[0].clsName).attr('id', id);
        elm.attr('data-type', properties[0].datatype);
        elm.css({
            'top': properties[0].top,
            'left': properties[0].left
        });

        //var strong = $('<strong>');
        if (properties[0].contenteditable) {
            elm.append("<i style='display: none' class='fa fa-trash fa-lg close-icon'></i>");
            var p = "<p " +
                "ondblclick='$(this).focus();'>" + properties[0].label + "</p>";
            //strong.append(p);
        } else {
            // Activity icons
            elm.append("<i style='display: none' class='fa fa-lg activity-icon assessment'></i>");
            elm.append("<i style='display: none' class='fa fa-lg activity-icon social'></i>");
            elm.append("<span style='display: none' class='label label-default duration'></span>");

            elm.append("<i style='display: none' class='fa fa-trash fa-lg close-icon'></i>");
            var p = $('<p>').text(properties[0].label);
            //strong.append(p);
        }
        elm.append(p);
        return elm;
    }

    function drawElement(element, canvasId, name) {
        $(canvasId).append(element);
        _addEndpoints(name, properties[0].startpoints, properties[0].endpoints);
        jsPlumbInstance.draggable(jsPlumbInstance.getSelector(".jtk-node"), {
            grid: [10, 10],
            filter: ".ui-resizable-handle",
            containment: true,
            drag: function(elm) {
                $(elm.el).siblings(".jtk-endpoint").hide();
            },
            stop: function(elm) {
                $(elm.el).siblings(".jtk-endpoint").show();
            }
        });
    }

    //*********** make the elements on the palette draggable ***************
    function makeDraggable(id, className, text) {
        var firstRun = true;
        $(id).draggable({
            helper: function(e) {
                var type = e.target.id.replace("handle-", "");
                return $("<div/>",{
                    text: typeFullNames[type],
                    class: className
                });
            },
            handle: ".drag-handles div",
            cursorAt: [0, 0],
            grid: [10, 10],
            drag: function(e, ui) {
                if (firstRun) {
                    ui.position.left -= Math.floor( ui.helper.width()/ 2 );
                    ui.position.top -= Math.floor( ui.helper.height()/ 2 );
                }
            },
            start: function(e, ui){
                $(this).draggable("option", "cursorAt", {
                    left: Math.floor(ui.helper.width() / 2),
                    top: Math.floor(ui.helper.height() / 2)
                });
            },
            stop : function( evt, ui ) { // Fires once
                if (firstRun) {
                    firstRun = false;
                };
            },
            stack: ".custom",
            revert: false
        });
    }

    makeDraggable("#reflectiveEv", "window reflective jsplumb-connected custom", "Reflective");
    makeDraggable("#productiveEv", "window productive jsplumb-connected custom", "Productive");
    makeDraggable("#exploratoryEv", "window exploratory jsplumb-connected custom", "Exploratory");
    makeDraggable("#directedEv", "window directed jsplumb-connected custom", "Directed");

    //make the editor canvas droppable
    $("#canvas").droppable({
        accept: ".window",
        drop: function (event, ui) {
            if (clicked) {
                clicked = false;
                elementOrganiser();
                var name = "Window" + elementCount;
                var id = "flowchartWindow" + elementCount;
                element = createElement(id);
                drawElement(element, "#canvas", name);
                element = "";
            }
        }
    });

    //load properties of a reflective element once the reflective element in the palette is clicked
    $('#reflectiveEv').mousedown(function (e) {
        var type = e.target.id.replace("handle-", "");
        loadProperties("window reflective custom jtk-node jsplumb-connected "+type, "0", "0", typeFullNames[type], ["BottomCenter"],["TopCenter"], type);
        clicked = true;
    });
    //load properties of a productive element once the productive element in the palette is clicked
    $('#productiveEv').mousedown(function (e) {
        var type = e.target.id.replace("handle-", "");
        loadProperties("window productive custom jtk-node jsplumb-connected "+type, "0", "0", typeFullNames[type], ["BottomCenter"], ["TopCenter"], type);
        clicked = true;
    });
    //load properties of a exploratory element once the exploratory element in the palette is clicked
    $('#exploratoryEv').mousedown(function (e) {
        var type = e.target.id.replace("handle-", "");
        loadProperties("window exploratory custom jtk-node jsplumb-connected "+type, "0", "0", typeFullNames[type], ["BottomCenter"], ["TopCenter"], type);
        clicked = true;
    });
    //load properties of a directed element once the directed element in the palette is clicked
    $('#directedEv').mousedown(function (e) {
        var type = e.target.id.replace("handle-", "");
        loadProperties("window directed custom jtk-node jsplumb-connected "+type, "0", "0", typeFullNames[type], ["BottomCenter"], ["TopCenter"], type);
        clicked = true;
    });

    $('[data-toggle="tooltip"]').tooltip({
        placement: 'right',
        container: 'body'
    });

    //de-select all the selected elements and hide the delete buttons and highlight the selected element
    $('#canvas').on('click', function (e) {
        $(".jtk-node").css({'outline': "none"});
        _saveActivity(); // auto save activity
        $("#activitySettingForm form").hide();
        $("#activitySettingForm").css("outline", "none");
        $(".close-icon").hide();
        if (e.target.getAttribute("class") != null && e.target.getAttribute("class").indexOf("jtk-demo-canvas") > -1) {
            $.each(jsPlumbInstance.getConnections(), function (index, connection) {
                connection.hideOverlay("close");
            });
        }

        if (e.target.nodeName == "P") {
            //e.target.parentElement.parentElement.style.outline = "3px dotted red";
            e.target.parentElement.style.outline = "3px dotted red";
        /*
        } else if (e.target.nodeName == "STRONG") {
            e.target.parentElement.style.outline = "3px dotted red";
        */
        } else if (e.target.getAttribute("class") != null && e.target.getAttribute("class").indexOf("jtk-node") > -1) {//when clicked the step, decision or i/o elements
            e.target.style.outline = "3px dotted red";
        }
    });

    //when an item is selected, highlight it and show the delete icon and setting panel
    var clickedWindow = null;
    $(document).on("click", ".custom", function () {
        // show the delete (fa-trash) icon
        clickedWindow = $(this).attr("id");
        var marginLeft = $(this).outerWidth() + 8 + "px";
        $(".close-icon").prop("title", "Delete the element");
        $(this).find("i.close-icon").css({'display': 'block', 'margin-left': marginLeft});

        // show the setting panel
        var type = "";
        if ($(this).hasClass("reflective")) {
            type = 'reflective';
        } else if ($(this).hasClass("productive")) {
            type = 'productive';
        } else if ($(this).hasClass("exploratory")) {
            type = 'exploratory';
        } else if ($(this).hasClass("directed")) {
            type = 'directed';
        }
        var subtype = $(this).attr("data-type");

        $("#activitySettingForm form").show();
        $("#activitySettingForm").css("outline", "3px solid "+typeColors[type]);
        if ($("#selectActivityType")[0].selectize) {
            $("#selectActivityType")[0].selectize.destroy();
        };
        $("#selectActivityType").selectize({
            options: eval(type+'Types'),
            labelField: 'name',
            searchField: ['name']
        });

        _clearActivity(function() {
            // default type (drag into canvas by drag handle)
            $("#selectActivityType")[0].selectize.addItem(subtype, 1);
            _loadActivity();
        });
    });

    $("#selectActivityType").change(function() {
        if (clickedWindow == null) return true; // do nothing if null
        var subtype = $(this).find('option:selected').val();
        $('#'+clickedWindow+' p').text(typeFullNames[subtype]);
        $('#'+clickedWindow).attr('data-type', subtype);
    });

    $("#selectActivitySocial").change(function() {
        var social = $(this).find('option:selected').val();
        if (social == "group") {
            $("#groupSizeDiv").show();
        } else {
            $("#groupSizeDiv").hide();
        }
    });

    $("#selectActivityMotivator, #selectActivityFeedback, #selectActivityResources, #selectActivityTools").selectize({
		maxItems: 5
	});

    _loadActivityIcons = function() {
        if (activities.length == 0) return true; // do nothing if null

        var social_icon = {default:"fa-user-o", individual:"fa-user", group:"fa-users", peer:"fa-users", class:"fa-users"};
        var assessment_icon = {default:"fa-question", 1:"icon-grading", 0:""};

        $.each(activities, function(index, a) {
            $('#'+a.elementId).popover('destroy');
            $('#'+a.elementId).popover({
                title: typeFullNames[a.type],
                content: a.description,
                container: 'body',
                trigger: 'hover'
            });

            // Change activity icons
            var icon_selector = '#'+a.elementId+' .activity-icon';
            var fa_icon;

            if (a.social === null) {
                fa_icon = social_icon['default'];
            } else {
                fa_icon = social_icon[a.social];
            }
            $(icon_selector+'.social').removeClass(
                _.uniq(_.map(social_icon, function(i, k){return i;})).join(" ")
            );
            $(icon_selector+'.social').addClass(fa_icon);

            if (a.assessment === undefined) {
                fa_icon = assessment_icon['default'];
            } else {
                fa_icon = assessment_icon[a.assessment];
            }
            $(icon_selector+'.assessment').removeClass(_.map(assessment_icon, function(i, k){return i;}).join(" "));
            $(icon_selector+'.assessment').addClass(fa_icon);

            $('#'+a.elementId+' span.duration').html(a.duration);

            $('.activity-icon').show();
            if ($('span.duration').html() != '') {
                $('span.duration').show();
            } else {
                $('span.duration').hide();
            }
        });
    }

    _saveActivity = function() {
        if (clickedWindow == null) return true; // do nothing if null
        var type = $("#selectActivityType").val();
        var description = $("#textareaActivityDesc").val();
        var assessment = $("input[name='inputActivityAssessment']:checked").val();
        var social = $("#selectActivitySocial").val();
        var groupsize = $("#selectActivityGroupSize").val();
        var feedback = $("#selectActivityFeedback").val();
        var motivator = $("#selectActivityMotivator").val();
        var duration = $("#inputActivityDuration").val();
        var setting = $("#selectActivitySetting").val();
        var resources = $("#selectActivityResources").val();
        var tools = $("#selectActivityTools").val();
        var notes = $("#textareaActivityNotes").val();

        activities[clickedWindow] = {
            elementId: clickedWindow,
            type: type,
            description: description,
            assessment: assessment,
            social: social,
            groupsize: groupsize,
            feedback: feedback,
            motivator: motivator,
            duration: duration,
            setting: setting,
            resources: resources,
            tools: tools,
            notes: notes
        };

        // Different shade of color for different activity type
        if ($('#'+clickedWindow) != null) {
            $('#'+clickedWindow).css('border-color', typeShadeColors[type]);
            $('#'+clickedWindow).popover('destroy');
            $('#'+clickedWindow).popover({
                title: typeFullNames[type],
                content: description,
                container: 'body',
                trigger: 'hover'
            });
        }

        // Change activity icons
        var icon_selector = '#'+clickedWindow+' .activity-icon';
        var fa_icon;
        var social_icon = {default:"fa-user-o", individual:"fa-user", group:"fa-users", peer:"fa-users", class:"fa-users"};
        var assessment_icon = {default:"fa-question", 1:"icon-grading", 0:""};

        if (social === null) {
            fa_icon = social_icon['default'];
        } else {
            fa_icon = social_icon[social];
        }
        $(icon_selector+'.social').removeClass(
            _.uniq(_.map(social_icon, function(i, k){return i;})).join(" ")
        );
        $(icon_selector+'.social').addClass(fa_icon);

        if (assessment === undefined) {
            fa_icon = assessment_icon['default'];
        } else {
            fa_icon = assessment_icon[assessment];
        }
        $(icon_selector+'.assessment').removeClass(_.map(assessment_icon, function(i, k){return i;}).join(" "));
        $(icon_selector+'.assessment').addClass(fa_icon);

        $('#'+clickedWindow+' span.duration').html(duration);

        $('.activity-icon').show();
        if ($('span.duration').html() != '') {
            $('span.duration').show();
        } else {
            $('span.duration').hide();
        }
    }

    _loadActivity = function() {
        var a = activities[clickedWindow];
        if (a !== undefined) {
            $("#selectActivityType")[0].selectize.addItem(a['type']);
            $("#textareaActivityDesc").val(a['description']);
            $("input[name='inputActivityAssessment']").filter('[value='+a['assessment']+']').prop('checked', true);
            $("#selectActivitySocial").val(a['social']);
            $("#selectActivityGroupSize").val(a['groupsize']);
            $.each(a['feedback'], function(index, value) {
                $("#selectActivityFeedback")[0].selectize.addItem(value);
            });
            $.each(a['motivator'], function(index, value) {
                $("#selectActivityMotivator")[0].selectize.addItem(value);
            });
            $("#inputActivityDuration").val(a['duration']);
            $("#selectActivitySetting").val(a['setting']);
            $.each(a['resources'], function(index, value) {
                $("#selectActivityResources")[0].selectize.addItem(value);
            });
            $.each(a['tools'], function(index, value) {
                $("#selectActivityTools")[0].selectize.addItem(value);
            });
            $("#textareaActivityNotes").val(a['notes']);
        }
    }

    _clearActivity = function(callback) {
        $('#activitySettingForm form').find('input:text, input[type="number"], input:file, select, textarea').val('');
        $('#activitySettingForm form').find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
        $("#inputActivityDuration").val("1");
        if($("#selectActivityType")[0].selectize) $("#selectActivityType")[0].selectize.clear();
        $("#selectActivityFeedback")[0].selectize.clear();
        $("#selectActivityMotivator")[0].selectize.clear();
        $("#selectActivityResources")[0].selectize.clear();
        $("#selectActivityTools")[0].selectize.clear();
        if (typeof callback === 'function' && callback()) {
            callback();
        }
    }

    _clearClickedWindow = function() {
        clickedWindow = null;
    }

    $("#btnSaveActivity").click(function() {
        _saveActivity();
    });

    $("#btnResetActivity").click(function() {
        alertify.confirm("Clear all settings for this activity?", function () {
            _clearActivity();
        });
    });

    $("#btnSampleActivity").click(function() {
        alertify.confirm("Fill in sample data in this form?", function () {
            $("#selectActivityType")[0].selectize.addItem('r2');
            $("#textareaActivityDesc").val('Hello World');
            $("input[name='inputActivityAssessment']").filter('[value=0]').prop('checked', true);
            $("#selectActivitySocial").val('group');
            $("#selectActivityGroupSize").val('5');
            $("#selectActivityFeedback")[0].selectize.addItem('auto');
            $("#selectActivityFeedback")[0].selectize.addItem('group');
            $("#selectActivityMotivator")[0].selectize.addItem('badges');
            $("#selectActivityMotivator")[0].selectize.addItem('score');
            $("#inputActivityDuration").val('10');
            $("#selectActivitySetting").val('f2fc');
            $("#selectActivityResources")[0].selectize.addItem('r2');
            $("#selectActivityResources")[0].selectize.addItem('r4');
            $("#selectActivityTools")[0].selectize.addItem('t1');
            $("#selectActivityTools")[0].selectize.addItem('t3');
            $("#textareaActivityNotes").val('Hello world');
        });
    });

    // Autolayout the flowchart using jquery-simulate-ext library
    $("#autolayoutBtn").click(function() {
        var canvasWidth = parseInt($("#myDiagram .jtk-demo-main").css("width"));
        var connections = jsPlumbInstance.getConnections();
        var sourceIds = _.pluck(connections, 'sourceId');
        var targetIds = _.pluck(connections, 'targetId');
        var start = _.first(_.difference(sourceIds, targetIds));
        var end = _.first(_.difference(targetIds, sourceIds));

        // Re-order the IDs
        var properOrder = reorderConnections(sourceIds, targetIds, []);

        // Calculate dx and dy, then do the drag-n-drop
        var withOutConnY = properOrder.length*140 + 10;
        $.each($("div[id^='flowchartWindow']"), function(index, connection) {
            var dx = dy = 0;
            // center the windows
            var windowWidth = parseInt($(this).css("width"));
            dx = canvasWidth/2 - windowWidth/2 - $(this).position().left;
            // arrange top position according to connections
            if (properOrder.indexOf($(this).attr("id")) > -1) {
                dy = properOrder.indexOf($(this).attr("id"))*140 + 10 - $(this).position().top;
            } else {
                dy = withOutConnY - $(this).position().top;
                withOutConnY = withOutConnY + 140;
            }
            // Execute the actual drag-n-drop
            $(this).simulate("drag-n-drop", {dx: dx, dy: dy});
        });
    });

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
            //console.log(order);
        });
        if (remainSources.length == 0 && remainTargets.length == 0) {
            return order;
        } else {
            reorderConnections(remainSources, remainTargets, order);
        }
    }

    //when the close-icon of an element is clicked, delete that element together with its endpoints
    $(document).on("click", ".close-icon", function () {
        var closeIcon = $(this);
        var elementId = closeIcon.parent().attr("id");
        alertify.confirm("Delete this activity?", function () {
            delete activities[elementId];

            jsPlumbInstance.remove(elementId);
            _clearActivity();
            $("#activitySettingForm form").hide();
            $("#activitySettingForm").css("outline", "none");

            //if there are no elements in the canvas, ids start from 1
            if ($(".jtk-node").length == 0) {
                elementCount = 0;
                elementList = [];
                jsPlumbInstance.empty('canvas');
            }

            for (var i = 0; i < endpointList.length; i++) {
                if (endpointList[i][0] == elementId) {
                    for (var j = 0; j < endpointList[i].length; j++) {
                        jsPlumbInstance.deleteEndpoint(endpointList[i][j]);
                        endpointList[i][j] = null;
                    }
                }
            }

            for (var i = 0; i < sourcepointList.length; i++) {
                if (sourcepointList[i][0] == elementId) {
                    for (var j = 0; j < sourcepointList[i].length; j++) {
                        jsPlumbInstance.deleteEndpoint(sourcepointList[i][j]);
                        sourcepointList[i][j] = null;
                    }
                }
            }
        }, function() {
            return true;
        });
    });

    _saveFlowchartObj = function() {
        console.log(elementList);
        if (elementCount == 0) {
            return {};
        }

        var totalCount = 0;
        var nodes = [];
        $(".jtk-node").each(function (index, element) {
            totalCount++;
            var $element = $(element);
            var type = $element.attr('class').toString().split(" ")[1];
            var subtype = $element.attr('data-type');
            if (type == "step" || type == "diamond" || type == "parallelogram") {
                nodes.push({
                    elementId: $element.attr('id'),
                    nodeType: type,
                    subType: subtype,
                    positionX: parseInt($element.css("left"), 10),
                    positionY: parseInt($element.css("top"), 10),
                    clsName: $element.attr('class').toString(),
                    label: $element.find('p').text(),
                    width: $element.outerWidth(),
                    height: $element.outerHeight()
                });
            } else {
                nodes.push({
                    elementId: $element.attr('id'),
                    nodeType: type,
                    subType: subtype,
                    positionX: parseInt($element.css("left"), 10),
                    positionY: parseInt($element.css("top"), 10),
                    clsName: $element.attr('class').toString(),
                    label: $element.find('p').text()
                });
            }
        });

        var connections = [];
        $.each(jsPlumbInstance.getConnections(), function (index, connection) {
            connections.push({
                connectionId: connection.id,
                sourceUUId: connection.endpoints[0].getUuid(),
                targetUUId: connection.endpoints[1].getUuid(),
            });
        });

        var pattern = {};
        pattern.pattern_csrf = $("#pattern_csrf").val();
        pattern.id = $("#patternId").val();
        pattern.name = $('#patternName').val();
        pattern.nodes = nodes;
        pattern.connections = connections;
        pattern.numberOfElements = totalCount;
        pattern.lastElementId = elementCount;
        pattern.activities = activities;

        return pattern;
    }

    //save the edited flowchart to a json string
    _saveFlowchart = function () {
        // check for errors first
        if ($("#patternName").val().trim() == "") {
            alertify.error("Please enter the name for this pattern.");
            $("#patternName").focus();
            return false;
        }

        var pattern = _saveFlowchartObj();

        // Temporary way to export a JSON file using FileSaver.js
        var json = JSON.stringify(pattern);
        //var blob = new Blob([json], {type: "application/json;charset=utf-8"});
        //saveAs(blob, "pattern.json");

        $.ajax({
            url: 'db/pattern.php',
            type: 'POST',
            data: pattern,
            dataType: "json",
            success: function (data) {
                $.get("token.php?mode=pattern", function(data) {
                    $("#pattern_csrf").val(data);
                });
                $("#patternId").val(data['id']);
                alertify.success(data['message']);
            },
            error: function () {
                $.get("token.php?mode=pattern", function(data) {
                    $("#pattern_csrf").val(data);
                });
                alertify.error('Flowchart saving error');
            }
        });
    }

    $("#flowchartSave").click(function() {
        _saveFlowchart();
    });

    _loadFlowchart = function(pattern) {
        $.each(pattern.nodes, function(index, value) {
            var name = value.elementId.replace('flowchart', '');
            loadProperties(value.clsName, value.positionX+'px', value.positionY+'px', value.label, ["BottomCenter"],["TopCenter"], value.subType);
            drawElement(createElement(value.elementId), "#canvas", name);
            elementList.push(parseInt(value.elementId.replace('flowchartWindow', '')));
        });

        $.each(pattern.connections, function(index, value) {
            jsPlumbInstance.connect({uuids:[value.sourceUUId, value.targetUUId]});
        });

        elementCount = pattern.nodes.length;
        activities = pattern.activities;
        _loadActivityIcons();
    }

    elementOrganiser = function() {
        var nodeCount = $('#myDiagram .flowchart-demo div[id^="flowchartWindow"]').length;
        var max = Math.max(...elementList);
        if (max == -Infinity) {
            elementCount++;
        } else {
            elementCount = max + 1;
        }
        elementList.push(elementCount);
    }

    if ($("#patternId").val()) {
        $.get("db/pattern.php",
            {get_pattern: $('#patternId').val()}
        ).done(function(data) {
            if (data.length) {
                pattern = JSON.parse(data);
                _loadFlowchart(pattern);
            }
        });
    }
});
