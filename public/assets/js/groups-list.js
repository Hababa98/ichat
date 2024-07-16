/**
 * Group List
 */

'use strict';

// Datatable (jquery)
$(function () {
  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  // Variable declaration for table
  var dt_user_table = $('.datatables-users'),
    select2 = $('.select2'),
    userView = baseUrl + '',
    statusObj = {
      1: { title: 'COD', class: 'bg-label-danger' },
      2: { title: 'Stripe', class: 'bg-label-success' }
    };

  if (select2.length) {
    var $this = select2;
    $this.wrap('<div class="position-relative"></div>').select2({
      placeholder: 'Select Country',
      dropdownParent: $this.parent()
    });
  }

  // Group List datatable
  if (dt_user_table.length) {
    var dt_user = dt_user_table.DataTable({
      serverSide: true,
      processing: true,
      pagination: 10,
      ajax: baseUrl + 'getgroupdata',
      columns: [
        { data: 'groupId' },
        { data: 'CastName' },
        { data: 'createrId' },
        { data: 'createrCountry' },
        { data: 'totalUsers' },
        { data: 'action' }
      ],

      columnDefs: [
        {
          // Group Id
          targets: 0,
          render: function (data, type, full, meta) {
            var $groupId = full['groupId'];

            return '<span class="fw-medium">' + $groupId + '</span>';
          }
        },
        {
          // Group Name
          targets: 1,
          render: function (data, type, full, meta) {
            var $castName = full['castName'];

            return '<span class="fw-medium">' + $castName + '</span>';
          }
        },
        {
          // Creator Details
          targets: 2,
          responsivePriority: 4,
          render: function (data, type, full, meta) {
            var $createrName = full['createrName'],
              $createrMobile = full['createrMobile'],
              $createrImg = full['createrImg'];

            // Ensure $createrName is defined
            if ($createrName) {
              if ($createrImg) {
                // For Avatar createrImg
                var $output = '<img src="' + $createrImg + '" alt="Avatar" class="rounded-circle">';
              } else {
                // For Avatar badge
                var stateNum = Math.floor(Math.random() * 6);
                var states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
                var $state = states[stateNum],
                  $initials = $createrName.match(/\b\w/g) || [];
                $initials = (($initials.shift() || '') + ($initials.pop() || '')).toUpperCase();
                $output =
                  '<span class="avatar-initial rounded-circle bg-label-' + $state + '">' + $initials + '</span>';
              }
              // Creates full output for row
              var $row_output =
                '<div class="d-flex justify-content-start align-items-center user-name">' +
                '<div class="avatar-wrapper">' +
                '<div class="avatar avatar-sm me-3">' +
                $output +
                '</div>' +
                '</div>' +
                '<div class="d-flex flex-column">' +
                '<span class="fw-medium">' +
                $createrName +
                '</span>' +
                '<small class="text-muted">' +
                $createrMobile +
                '</small>' +
                '</div>' +
                '</div>';
              return $row_output;
            } else {
              return '';
            }
          }
        },
        {
          // Creator Country
          targets: 3,
          render: function (data, type, full, meta) {
            var $createrCountry = full['createrCountry'];

            return '<span class="fw-medium">' + $createrCountry + '</span>';
          }
        },
        {
          // Total Users
          targets: 4,
          render: function (data, type, full, meta) {
            var $totalUsers = full['totalUsers'];

            return '<span class="badge bg-label-secondary">' + $totalUsers + '</span>';
          }
        },
        {
          // Actions
          targets: 5,
          title: 'Actions',
          searchable: false,
          orderable: false,
          render: function (data, type, full, meta) {
            var userId = baseUrl + 'group-view' + '/' + full.groupId;
            return (
              '<div class="d-inline-block text-nowrap">' +
              '<a href="' +
              userId +
              '" data-bs-toggle="tooltip" class="text-body" data-bs-placement="top" title="Preview Group"><i class="bx bx-show mx-1"></i></a>' +
              '<button class="btn btn-sm btn-icon delete-record" onclick="deleteGroup(\'' +
              full.groupId +
              '\' )"><i class="bx bx-trash"></i></button>' +
              '</div>'
            );
          }
        }
      ],
      order: [[0, 'desc']],
      dom:
        '<"row mx-2"' +
        '<"col-md-2"<"me-3"l>>' +
        '<"col-md-10"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-end flex-md-row flex-column mb-3 mb-md-0"f>>' +
        '>t' +
        '<"row mx-2"' +
        '<"col-sm-12 col-md-6"i>' +
        '<"col-sm-12 col-md-6"p>' +
        '>',
      displayLength: 10,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      autoWidth: false,

      language: {
        sLengthMenu: '_MENU_',
        search: '',
        searchPlaceholder: 'Search..'
      },

      // For responsive popup
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Details of ' + data['full_name'];
            }
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
              return col.title !== ''
                ? '<tr data-dt-row="' +
                    col.rowIndex +
                    '" data-dt-column="' +
                    col.columnIndex +
                    '">' +
                    '<td>' +
                    col.title +
                    ':' +
                    '</td> ' +
                    '<td>' +
                    col.data +
                    '</td>' +
                    '</tr>'
                : '';
            }).join('');

            return data ? $('<table class="table"/><tbody />').append(data) : false;
          }
        }
      },
      initComplete: function () {
        // Adding role filter once table initialized
        this.api()
          .columns(2)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="UserRole" class="form-select text-capitalize"><option value=""> Select Role </option></select>'
            )
              .appendTo('.user_role')
              .on('change', function () {
                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val ? '^' + val + '$' : '', true, false).draw();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                if (d !== undefined) {
                  select.append('<option value="' + d + '">' + d + '</option>');
                }
              });
          });
        // Adding plan filter once table initialized
        this.api()
          .columns(3)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="UserPlan" class="form-select text-capitalize"><option value=""> Select Plan </option></select>'
            )
              .appendTo('.user_plan')
              .on('change', function () {
                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val ? '^' + val + '$' : '', true, false).draw();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                if (d !== undefined) {
                  select.append('<option value="' + d + '">' + d + '</option>');
                }
              });
          });
        // Adding status filter once table initialized
        this.api()
          .columns(5)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="FilterTransaction" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
            )
              .appendTo('.user_status')
              .on('change', function () {
                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val ? '^' + val + '$' : '', true, false).draw();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                if (statusObj[d] && statusObj[d].title) {
                  select.append(
                    '<option value="' +
                      statusObj[d].title +
                      '" class="text-capitalize">' +
                      statusObj[d].title +
                      '</option>'
                  );
                }
              });
          });
      }
    });

    // To remove default btn-secondary in export buttons
    $('.dt-buttons > .btn-group > button').removeClass('btn-secondary');
  }

  // Delete Record
  $('.datatables-users tbody').on('click', '.delete-record', function () {
    dt_user.row($(this).parents('tr')).remove().draw();
  });

  // Filter form control to default size

  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});

// Validation & Phone mask
(function () {
  const phoneMaskList = document.querySelectorAll('.phone-mask'),
    addNewUserForm = document.getElementById('addNewUserForm');

  // Phone Number
  if (phoneMaskList) {
    phoneMaskList.forEach(function (phoneMask) {
      new Cleave(phoneMask, {
        phone: true,
        phoneRegionCode: 'US'
      });
    });
  }
  // Add New User Form Validation
  const fv = FormValidation.formValidation(addNewUserForm, {
    fields: {
      userFullname: {
        validators: {
          notEmpty: {
            message: 'Please enter fullname '
          }
        }
      },
      userEmail: {
        validators: {
          notEmpty: {
            message: 'Please enter your email'
          },
          emailAddress: {
            message: 'The value is not a valid email address'
          }
        }
      }
    },
    plugins: {
      trigger: new FormValidation.plugins.Trigger(),
      bootstrap5: new FormValidation.plugins.Bootstrap5({
        // Use this for enabling/changing valid/invalid class
        eleValidClass: '',
        rowSelector: function (field, ele) {
          // field is the field name & ele is the field element
          return '.mb-3';
        }
      }),
      submitButton: new FormValidation.plugins.SubmitButton(),
      // Submit the form when all fields are valid
      autoFocus: new FormValidation.plugins.AutoFocus()
    }
  });
})();

function deleteGroup(userId) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this action!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete group',
    customClass: {
      confirmButton: 'btn btn-primary me-2',
      cancelButton: 'btn btn-label-secondary'
    },
    buttonsStyling: false
  }).then(function (result) {
    if (result.value) {
      // Get the CSRF token from a meta tag in your HTML
      var csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

      // Make an AJAX request to delete the user
      $.ajax({
        method: 'POST',
        url: 'groups-delete/' + userId,
        data: {
          _token: csrfToken
        },
        success: function (response) {
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Group has been removed.',
              customClass: {
                confirmButton: 'btn btn-success'
              }
            });
            location.reload(); // Reload the page
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete Group.',
              customClass: {
                confirmButton: 'btn btn-danger'
              }
            });
          }
        }
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: 'Cancelled',
        text: 'Cancelled Delete :)',
        icon: 'error',
        customClass: {
          confirmButton: 'btn btn-success'
        }
      });
    }
  });
}
