var design_list_table;

$(document).ready( function () {
    design_list_table = $('#designs_list').DataTable({
        "initComplete": function() {
            $('.designDelBtn').click(function() {
                var courseId = $(this).attr('data-id');
                deleteDesign(courseId);
            });
            $('.designCopyBtn').click(function() {
                var courseId = $(this).attr('data-id');
                copyDesign(courseId);
            });
        },
        "columnDefs": [{
            "targets": -1,
            "orderable": false
        }]
    });
});

function copyDesign(courseId) {
    alertify.confirm("Are you sure you want to copy this design?", function (e) {
        if (e) {
            $.get("db/course_level.php",
                {copy_design: courseId}
            ).done(function(data) {
                var obj = JSON.parse(data);
                if (typeof obj != "undefined") {
                    if (obj['type'] == 'success') {
                        alertify.success(obj['message']);
                        reloadDesignListTable();
                    } else {
                        alertify.error(obj['message']);
                    }
                } else {
                    alertify.error('Unknown or no response from server');
                }
            });
        }
    });
}

function deleteDesign(courseId) {
    alertify.confirm("Are you sure you want to delete this design?", function (e) {
        if (e) {
            $.get("db/course_level.php",
                {delete_design: courseId}
            ).done(function(data) {
                var obj = JSON.parse(data);
                if (typeof obj != "undefined") {
                    if (obj['type'] == 'success') {
                        alertify.success(obj['message']);
                        reloadDesignListTable();
                    } else {
                        alertify.error(obj['message']);
                    }
                } else {
                    alertify.error('Unknown or no response from server');
                }
            });
        }
    });
}

function reloadDesignListTable() {
    design_list_table.destroy();
    design_list_table = $('#designs_list').DataTable({
        "ajax": "db/course_level.php?get_all_designs=1",
        "initComplete": function() {
            $('.designDelBtn').click(function() {
                var courseId = $(this).attr('data-id');
                deleteDesign(courseId);
            });
            $('.designCopyBtn').click(function() {
                var courseId = $(this).attr('data-id');
                copyDesign(courseId);
            });
        },
        "columnDefs": [{
            "targets": 0,
            "data": null,
            "render": function (data, type, full, meta) {
                return '<a href="design_edit.php?id='+data[5]+'">'+data[0]+'</a>';
            }
        },
        {
            "targets": -1,
            "orderable": false,
            "data": null,
            "render": function(data, type, full, meta) {
                var editBtn = '<a href="design_edit.php?id='+data[5]+'" class="btn btn-default btn-sm" title="Edit">';
                editBtn += '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>';
                editBtn += '</a>';
                var copyBtn = '<a data-id="'+data[5]+'" class="btn btn-default btn-sm designCopyBtn" title="Copy">';
                copyBtn += '<span class="glyphicon glyphicon-duplicate" aria-hidden="true"></span>';
                copyBtn += '</a>';
                var delBtn = '<a data-id="'+data[5]+'" class="btn btn-default btn-sm designDelBtn" title="Delete">';
                delBtn += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
                delBtn += '</a>';
                var allBtn = '<div class="btn-group">'+ editBtn + copyBtn + delBtn + '</div>';
                return allBtn;
            }
        }]
    });
}
