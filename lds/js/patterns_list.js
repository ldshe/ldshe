var patterns_list_table;

$(document).ready( function () {
    patterns_list_table = $('#patterns_list').DataTable({
        "initComplete": function() {
            $('.patternDelBtn').click(function() {
                var patternId = $(this).attr('data-id');
                deleteDesign(patternId);
            });
            $('.patternCopyBtn').click(function() {
                var patternId = $(this).attr('data-id');
                copyDesign(patternId);
            });
        },
        "order": [[3, "desc"]],
        "columnDefs": [{
            "targets": -1,
            "orderable": false
        }]
    });
});

function copyDesign(patternId) {
    alertify.confirm("Are you sure you want to copy this pattern?", function (e) {
        if (e) {
            $.get("db/pattern.php",
                {copy_pattern: patternId}
            ).done(function(data) {
                var obj = JSON.parse(data);
                if (typeof obj != "undefined") {
                    if (obj['type'] == 'success') {
                        alertify.success(obj['message']);
                        reloadPatternListTable();
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

function deleteDesign(patternId) {
    alertify.confirm("Are you sure you want to delete this pattern?", function (e) {
        if (e) {
            $.get("db/pattern.php",
                {delete_pattern: patternId}
            ).done(function(data) {
                var obj = JSON.parse(data);
                if (typeof obj != "undefined") {
                    if (obj['type'] == 'success') {
                        alertify.success(obj['message']);
                        reloadPatternListTable();
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

function reloadPatternListTable() {
    patterns_list_table.destroy();
    patterns_list_table = $('#patterns_list').DataTable({
        "ajax": "db/pattern.php?get_all_patterns=1",
        "initComplete": function() {
            $('.patternDelBtn').click(function() {
                var patternId = $(this).attr('data-id');
                deleteDesign(patternId);
            });
            $('.patternCopyBtn').click(function() {
                var patternId = $(this).attr('data-id');
                copyDesign(patternId);
            });
        },
        "columnDefs": [{
            "targets": 0,
            "data": null,
            "render": function (data, type, full, meta) {
                return '<a href="pattern_edit.php?id='+data[4]+'">'+data[0]+'</a>';
            }
        },
        {
            "targets": -1,
            "orderable": false,
            "data": null,
            "render": function(data, type, full, meta) {
                var editBtn = '<a href="pattern_edit.php?id='+data[4]+'" class="btn btn-default btn-sm" title="Edit">';
                editBtn += '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>';
                editBtn += '</a>';
                var copyBtn = '<a data-id="'+data[4]+'" class="btn btn-default btn-sm patternCopyBtn" title="Copy">';
                copyBtn += '<span class="glyphicon glyphicon-duplicate" aria-hidden="true"></span>';
                copyBtn += '</a>';
                var delBtn = '<a data-id="'+data[4]+'" class="btn btn-default btn-sm patternDelBtn" title="Delete">';
                delBtn += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
                delBtn += '</a>';
                var allBtn = '<div class="btn-group">'+ editBtn + copyBtn + delBtn + '</div>';
                return allBtn;
            }
        }]
    });
}
