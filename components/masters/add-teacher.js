import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import * as fbc from '../../firebase/firebaseConstants';
import { RequestaddorUpdateTeacher } from '../../firebase/masterAPIS';
import * as utility from '../../libraries/utility';
const AddorUpdateTeacher = ({ setselectTeacher, selectTeacher, setTeacherModal }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectedModules, setselectedModules] = useState([]);
  // const [selectTeacher, setselectTeacher] = useState(selectTeacher);

  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  };
  useEffect(() => {
    $('#modulesdiv').empty()
    addModule('Courses', fbc.COURSESMODULE);

    $('#teacherstatusswitch').change(function () {
      if (this.checked) {
        $('#teacherstatus_text').text('Teacher Active');
      } else {
        $('#teacherstatus_text').text('Teacher In-Active');
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
    console.log({ selectTeacher });
    if (selectTeacher == null) {
      return;
    }
    $('#teachername').val(selectTeacher[fbc.TEACHER_NAME]);
    $('#teacheremail').val(selectTeacher[fbc.TEACHER_EMAILADDRESS]);
    $('#phonenumber').val(selectTeacher[fbc.TEACHER_PHONENUMBER]);

    $('#teacherstatusswitch')
      .prop('checked', selectTeacher[fbc.TEACHER_STATUS])
      .trigger('change');


    var accessModules = selectTeacher[fbc.TEACHER_MODULES];
    $('.module').each(function () {
      var $this = $(this);
      $this
        .prop('checked', accessModules.includes($this.val()))
        .trigger('change');
    });
  }, [selectTeacher]);

  function addModule(moduleName, moduleObject) {
    var moduleItems = ``;
    Object.keys(moduleObject.modules).map((key) => {
      var moduleDetails = moduleObject.modules[key];

      moduleItems += ` 
                <div class="p-2 me-1 mb-2">
                <div class="form-check form-check-sm form-check-custom form-check-solid  form-check-success px-4 py-3 border rounded shadow-md">
                                                <input class="form-check-input module" value="${key}" type="checkbox" id="${key}" />
                                                <label class="form-check-label text-dark ms-4 fs-4 fw-bold border-start border-1 border-secondary ps-4" for="${key}">
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
    $('#teacherstatusswitch').prop('checked', false).trigger('change');
  }

  function initModal() {
    var element;
    var submitButton;
    var cancelButton;
    var closeButton;
    var form;
    var modal;

    element = document.querySelector('#modal_addteacher');
    modal = new bootstrap.Modal(element);
    setTeacherModal(modal);
    submitButton = document.querySelector('#modal_addteacher_submit');
    cancelButton = document.querySelector('#modal_addteacher_cancel');
    closeButton = document.querySelector('#modal_addteacher_close');

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
    if (utility.isInputEmpty('teachername')) {
      $('#teachername').addClass('is-invalid');
      message = 'Please Add Teacher Name.';
      utility.showtippy('teachername', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('phonenumber')) {
      $('#phonenumber').addClass('is-invalid');
      message = 'Please Add Teacher Phone Number.';
      utility.showtippy('phonenumber', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if

      (utility.getinputValue('phonenumber').length != 10 ||
      !(/^\d{10}$/.test(utility.getinputValue('phonenumber')))

    ) {
      $('#phonenumber').addClass('is-invalid');
      message = 'Please Add Valid 10 Digit Teacher Phone Number.';
      utility.showtippy('phonenumber', message, 'danger');
      showsnackbar('error', message);
      return false;
    }

    else if (
      utility.isInputEmpty('teacheremail') ||
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        utility.getinputValue('teacheremail')
      )
    ) {
      $('#teacheremail').addClass('is-invalid');
      message = 'Please Add Teacher Email.';
      utility.showtippy('teacheremail', message, 'danger');
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

  const addorUpdateTeacher = async () => {
    if (checkifDataisCorrect()) {
      console.log(selectTeacher !== null);
      console.log({ selectTeacher });
      var empUID =
        selectTeacher !== null
          ? selectTeacher[fbc.TEACHER_UID]
          : utility.randomstring() + '_' + utility.getTimestamp();

      var empObj = {
        [fbc.TEACHER_UID]: empUID,
        [fbc.TEACHER_NAME]: utility.getinputValue('teachername'),
        [fbc.TEACHER_EMAILADDRESS]: utility.getinputValue('teacheremail'),
        [fbc.TEACHER_PHONENUMBER]: utility
          .getinputValue('phonenumber')
          .toLowerCase(),
        [fbc.TEACHER_MODULES]: selectedModules,
        [fbc.TEACHER_STATUS]: $('#teacherstatusswitch').is(':checked'),
        [fbc.TEACHER_ISADMIN]: $('#adminstatusswitch').is(':checked'),
      };

      console.log({ empObj });
      utility.showloading();

      var addorUpdateTeacher = await RequestaddorUpdateTeacher(empObj);
      utility.hideloading();
      if (addorUpdateTeacher.status) {
        utility.success_alert(
          'Teacher ' + (selectTeacher !== null ? 'Updated' : 'Added'),
          'Details Added successfully.',
          'OKAY',
          utility.reloadPage,
          null
        );
      } else {
        var message = 'Failed To Add Teacher, ' + addorUpdateTeacher.message;
        showsnackbar('error', message);
      }
    }
  };
  return (
    <div
      data-backdrop="static" data-keyboard="false"
      className="modal fade"
      id="modal_addteacher"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl">
        <div className="modal-content">
          <div className="modal-header p-5" id="modal_addteacher_header">
            <h4 className="fw-bold">Add / Modify Teacher</h4>

            <button
              id="modal_addteacher_close"
              className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
            >
              <span className="ri-close-line fs-1"></span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="fv-row mb-7 col-md-4">
                <label className="required fs-6 fw-semibold mb-2">
                  Teacher Name
                </label>

                <input
                  id="teachername"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-4">
                <label className="required fs-6 fw-semibold mb-2">
                  <span className="required"> Teacher Phone Number</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"

                  ></i>
                </label>

                <input
                  id="phonenumber"
                  type="text"
                  data-bs-toggle="tooltip"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-4">
                <label className="fs-6 fw-semibold mb-2">
                  <span className="required"> Teacher Email</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"
                    title="Email address must be active"
                  ></i>
                </label>

                <input
                  id="teacheremail"
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
                      name="teacherstatus"
                      type="checkbox"
                      value="1"
                      id="teacherstatusswitch"
                    />
                  </label>

                  <div className="me-5 border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="teacherstatusswitch"
                      className="fs-6 fw-semibold"
                    >
                      Teacher Status
                      <br />
                      <span
                        id="teacherstatus_text"
                        className="fs-7 fw-semibold text-muted"
                      >
                        Teacher In-Active
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
              id="modal_addteacher_cancel"
              className="btn py-2 btn-light me-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="modal_addteacher_submit"
              onClick={(e) => addorUpdateTeacher()}
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

export default AddorUpdateTeacher;
