import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import * as fbc from '../../firebase/firebaseConstants';
import { RequestaddorUpdateEmployee } from '../../firebase/masterAPIS';
import * as utility from '../../libraries/utility';
const AddorUpdateEmployee = ({ setselectUser, selectUser, setUserModal }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectedModules, setselectedModules] = useState([]);
  // const [selectUser, setselectUser] = useState(selectUser);

  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  };
  useEffect(() => {
    $('#modulesdiv').empty()
    addModule('Masters', fbc.MASTERMODULE);
    addModule('Courses', fbc.COURSESMODULE);

    $('#employeestatusswitch').change(function () {
      if (this.checked) {
        $('#employeestatus_text').text('Employee Active');
      } else {
        $('#employeestatus_text').text('Employee In-Active');
      }
    });

    $('#adminstatusswitch').change(function () {
      $('.module').prop('disabled', this.checked);
      $('.module').prop('checked', this.checked).trigger('change');

      if (this.checked) {
        $('#adminstatus_text').text('Admin Access Enabled');
      } else {
        $('#adminstatus_text').text('Admin Access Disabled');
      }
    });

    $('.module').change(function () {
      setselectedModules((modules) => {
        var array = modules;
        if (this.checked) {
          if (!array.includes(this.value)) {
            array.push(this.value);
          }
          return array;
        } else {
          return utility.removeItemAllFromArray(array, this.value);
        }
      });
    });
    initModal();
  }, []);

  useEffect(() => {
    console.log({ selectUser });
    if (selectUser == null) {
      return;
    }
    $('#employeename').val(selectUser[fbc.EMPLOYEE_NAME]);
    $('#employeecode').val(selectUser[fbc.EMPLOYEE_CODE]);
    $('#employeeemail').val(selectUser[fbc.EMPLOYEE_EMAILADDRESS]);

    $('#employeestatusswitch')
      .prop('checked', selectUser[fbc.EMPLOYEE_STATUS])
      .trigger('change');
    $('#adminstatusswitch')
      .prop('checked', selectUser[fbc.EMPLOYEE_ISADMIN])
      .trigger('change');

    var accessModules = selectUser[fbc.EMPLOYEE_MODULES];
    $('.module').each(function () {
      var $this = $(this);
      $this
        .prop('checked', accessModules.includes($this.val()))
        .trigger('change');
    });
  }, [selectUser]);

  function addModule(moduleName, moduleObject) {
    var moduleItems = ``;
    Object.keys(moduleObject.modules).map((key) => {
      var moduleDetails = moduleObject.modules[key];

      moduleItems += ` 
                <div class="p-2 me-1 mb-2">
                <div class="form-check form-check-sm form-check-custom form-check-solid  form-check-success px-4 py-3 border rounded shadow-md">
                                                <input class="form-check-input module" value="${key}" type="checkbox" id="${key}" />
                                                <label class="form-check-label text-dark ms-4 fs-6 mb-0 fw-bold border-start border-1 border-secondary ps-4" for="${key}">
                                                ${moduleDetails.label}
                                                </label>
                                            </div>
                                            </div>
                                            `;
    });

    var modulediv = ` <div class="form-group mt-3 mx-0 border rounded p-2 ">
                                    <span class="text-md mb-0  fw-bold">${moduleName} Modules</span>
                                    <hr class="text-muted my-2" />
                                    <div class="d-flex flex-wrap">
                                        ${moduleItems}
                                    </div>
                                </div>`;

    $('#modulesdiv').append(modulediv);
  }
  function clearAll() {
    $('.form-control').val('');
    $('.module').prop('disabled', false);
    $('.module').prop('checked', false).trigger('change');
    $('#employeestatusswitch').prop('checked', false).trigger('change');
    $('#adminstatusswitch').prop('checked', false).trigger('change');
  }

  function initModal() {
    var element;
    var submitButton;
    var cancelButton;
    var closeButton;
    var form;
    var modal;

    element = document.querySelector('#modal_adduser');
    modal = new bootstrap.Modal(element);
    setUserModal(modal);
    submitButton = document.querySelector('#modal_adduser_submit');
    cancelButton = document.querySelector('#modal_adduser_cancel');
    closeButton = document.querySelector('#modal_adduser_close');

    closeButton.addEventListener('click', function (e) {
      e.preventDefault();
      clearAll();
      modal.hide();
    });
    cancelButton.addEventListener('click', function (e) {
      e.preventDefault();
      clearAll();
      modal.hide();
    });
  }

  function checkifDataisCorrect() {
    $('.is-invalid').removeClass('is-invalid');
    var message = '';
    if (utility.isInputEmpty('employeename')) {
      $('#employeename').addClass('is-invalid');
      message = 'Please Add Employee Name.';
      utility.showtippy('employeename', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (
      utility.isInputEmpty('employeecode') ||
      !/^[a-z0-9_.]+$/.test(utility.getinputValue('employeecode'))
    ) {
      $('#employeecode').addClass('is-invalid');
      message = 'Please Add Employee Code.';
      utility.showtippy('employeecode', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (
      utility.isInputEmpty('employeeemail') ||
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        utility.getinputValue('employeeemail')
      )
    ) {
      $('#employeeemail').addClass('is-invalid');
      message = 'Please Add Employee Email.';
      utility.showtippy('employeeemail', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (selectedModules.length == 0) {
      message = 'Please Select At Least 01 Module.';
      utility.showtippy('modulesdiv', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else {
      return true;
    }
  }

  const addorUpdateEmployee = async () => {
    if (checkifDataisCorrect()) {
      console.log(selectUser !== null);
      console.log({ selectUser });
      var empUID =
        selectUser !== null
          ? selectUser[fbc.EMPLOYEE_UID]
          : utility.randomstring() + '_' + utility.getTimestamp();

      var empObj = {
        [fbc.EMPLOYEE_UID]: empUID,
        [fbc.EMPLOYEE_NAME]: utility.getinputValue('employeename'),
        [fbc.EMPLOYEE_EMAILADDRESS]: utility.getinputValue('employeeemail'),
        [fbc.EMPLOYEE_CODE]: utility
          .getinputValue('employeecode')
          .toLowerCase(),
        [fbc.EMPLOYEE_MODULES]: selectedModules,
        [fbc.EMPLOYEE_STATUS]: $('#employeestatusswitch').is(':checked'),
        [fbc.EMPLOYEE_ISADMIN]: $('#adminstatusswitch').is(':checked'),
      };

      console.log({ empObj });
      utility.showloading();

      var addorUpdateEmployee = await RequestaddorUpdateEmployee(empObj);
      utility.hideloading();
      if (addorUpdateEmployee.status) {
        utility.success_alert(
          'Employee ' + (selectUser !== null ? 'Updated' : 'Added'),
          'Details Added successfully.',
          'OKAY',
          utility.reloadPage,
          null
        );
      } else {
        var message = 'Failed To Add Employee, ' + addorUpdateEmployee.message;
        showsnackbar('error', message);
      }
    }
  };
  return (
    <div
      className="modal fade"
      id="modal_adduser"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl">
        <div className="modal-content">
          <div className="modal-header p-5" id="modal_adduser_header">
            <h4 className="fw-bold">Add / Modify Employee</h4>

            <button
              id="modal_adduser_close"
              className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
            >
              <span className="ri-close-line fs-1"></span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="fv-row mb-7 col-md-4">
                <label className="required fs-6 fw-semibold mb-2">
                  Employee Name
                </label>

                <input
                  id="employeename"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-4">
                <label className="required fs-6 fw-semibold mb-2">
                  <span className="required"> Employee Code</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"
                    title="use a-z, 0-9."
                  ></i>
                </label>

                <input
                  id="employeecode"
                  type="text"
                  data-bs-toggle="tooltip"
                  title="use a-z, 0-9."
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-4">
                <label className="fs-6 fw-semibold mb-2">
                  <span className="required"> Employee Email</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"
                    title="Email address must be active"
                  ></i>
                </label>

                <input
                  id="employeeemail"
                  type="email"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                  name="email"
                />
              </div>
            </div>
            <div className="d-flex row g-9 my-4">
              <div className="col-md-4 fv-row m-0">
                <div className="d-flex flex-row  border p-2 rounded">
                  <label className="form-check form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                    <input
                      className="form-check-input ms-3"
                      name="employeestatus"
                      type="checkbox"
                      value="1"
                      id="employeestatusswitch"
                    />
                  </label>

                  <div className="me-5 border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="employeestatusswitch"
                      className="fs-6 fw-semibold"
                    >
                      User Status
                      <br />
                      <span
                        id="employeestatus_text"
                        className="fs-7 fw-semibold text-muted"
                      >
                        Employee In-Active
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-md-4 fv-row m-0">
                <div className="d-flex flex-row border p-2 rounded">
                  <label className="form-check form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                    <input
                      className="form-check-input ms-3"
                      name="employeestatus"
                      type="checkbox"
                      value="1"
                      id="adminstatusswitch"
                    />
                  </label>

                  <div className="me-5 border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="adminstatusswitch"
                      className="fs-6 fw-semibold"
                    >
                      Employee is Admin?
                      <br />
                      <span
                        id="adminstatus_text"
                        className="fs-7 fw-semibold text-muted"
                      >
                        Admin Access Disabled
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <h5 className="d-flex flex-column bg-light p-3 rounded border-2 border text-muted justify-content-center fs-4 mt-15">
              Module Access
            </h5>

            <div id="modulesdiv">
              
            </div>
          </div>

          <div className="modal-footer flex-end p-3">
            <button
              type="reset"
              id="modal_adduser_cancel"
              className="btn py-2 btn-light me-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="modal_adduser_submit"
              onClick={(e) => addorUpdateEmployee()}
              className="btn py-2 btn-primary"
            >
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddorUpdateEmployee;
