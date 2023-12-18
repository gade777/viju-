import { USER_FULLNAME, USER_ID } from '@/constants/appconstants';
import { db, storage } from '@/firebase/firebaseconfig';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import $ from 'jquery';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ulid } from 'ulid';
import { USER_ISADMIN } from '../../constants/appconstants';
import * as fbc from '../../firebase/firebaseConstants';
import { RequestaddorUpdateSubject } from '../../firebase/masterAPIS';
import * as utility from '../../libraries/utility';
const AddorUpdateSubject = ({ setselectSubject, selectSubject, setSubjectModal }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [subjectThumbnailURL, setsubjectThumbnailURL] = useState("https://placehold.co/200");
  const [imageFile, setimageFile] = useState(null);
  const [courseschoices, setcourseschoices] = useState(null);
  const [accesschoices, setaccesschoices] = useState(null);
  const [keywordchoices, setkeywordchoices] = useState(null);
  const [allCourseDocs, setCourseDocs] = useState([]);
  const [allUsers, setallUsers] = useState([]);

  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  };
  const errorCallback = (err) => {
    utility.hideloading();
    showsnackbar('error', err.message);
  };
  useEffect(() => {
    $('#subjectstatusswitch').change(function () {
      if (this.checked) {
        $('#subjectstatus_text').text('Subject Active');
      } else {
        $('#subjectstatus_text').text('Subject In-Active');
      }
    });
    $('#subjecthasasmtswitch').change(function () {
      if (this.checked) {
        $('#subjecthasasmt_text').text('Have Assessments');
      } else {
        $('#subjecthasasmt_text').text('Doesn&apos;t Have Assessments');
      }
    });


    initModal();
  }, []);

  useEffect(() => {
    console.log({ selectSubject });
    if (selectSubject == null) {
      return;
    }
    $('#subjectname').val(selectSubject[fbc.SUBJECT_NAME]);
    $('#subjectcode').val(selectSubject[fbc.SUBJECT_CODE]);
    keywordchoices.setValue(selectSubject[fbc.SUBJECT_KEYWORDS]);
    accesschoices.setChoiceByValue(selectSubject[fbc.SUBJECT_ACCESSUSERUIDARRAY]);
    courseschoices.setChoiceByValue(selectSubject[fbc.SUBJECT_COURSE].uid);
    setsubjectThumbnailURL(selectSubject[fbc.SUBJECT_THUMBNAILURL])
    $('#subjectstatusswitch')
      .prop('checked', selectSubject[fbc.SUBJECT_STATUS])
      .trigger('change');
    $('#subjecthasasmtswitch')
      .prop('checked', selectSubject[fbc.SUBJECT_HASASSESSMENTS])
      .trigger('change');


  }, [selectSubject]);


  function clearAll() {
    $('.form-control').val('');
    $('#subjectstatusswitch').prop('checked', false).trigger('change');
    $('#subjecthasasmtswitch').prop('checked', false).trigger('change');
    courseschoices.setChoiceByValue("")
    accesschoices.removeActiveItems()
    keywordchoices.removeActiveItems()
    keywordchoices.removeHighlightedItems()
    setsubjectThumbnailURL("https://placehold.co/200")
    setimageFile(() => {
      return null
    })
  }


  useEffect(() => {
    if (allCourseDocs.length == 0) {
      return
    }
    var coursesArray = [
      { value: "", label: "Select Course", placeholder: true, disabled: true, selected: true },]
    allCourseDocs.map((course) => {
      coursesArray.push({
        value: course.uid,
        customProperties: course,
        label: course.name
      })
    })
    console.log({ coursesArray });
    setcourseschoices(
      new Choices($("#courseselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: true,
        resetScrollPosition: false,
        placeholderValue: "",
        classNames: {
          containerInner: "choices__inner bg-white rounded  text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
        },
        choices: coursesArray,
      })
    );
  }, [allCourseDocs])
  async function getAllCourses() {
    utility.showloading();
    try {
      const CourseReF = collection(db, fbc.COURSE_COLLECTION);
      var allCourses = [];
      var params = [];
      if (!utility.get_keyvalue(USER_ISADMIN)) {
        params.push(where(fbc.COURSE_ACCESSUSERUIDARRAY, "array-contains", utility.get_keyvalue(USER_ID)))
      }
      let q = query(CourseReF,
        ...params,
        orderBy(fbc.COURSE_NAME));
      const querySnapshot = await getDocs(q);
      console.log("size L " + querySnapshot.size);
      querySnapshot.forEach((doc) => {
        allCourses.push({
          details: {
            board: doc.data()[fbc.COURSE_BOARD],
            field: doc.data()[fbc.COURSE_FIELD],
            code: doc.data()[fbc.COURSE_CODE],
            uid: doc.id,
            name: doc.data()[fbc.COURSE_NAME],
          },
          uid: doc.id,
          name: doc.data()[fbc.COURSE_NAME],
        });
      });
      setCourseDocs(allCourses);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    getAllUsers()
    utility.hideloading();
  }
  async function getAllUsers() {
    var allUsers = [];
    utility.showloading();
    try {
      const EmployeeReF = collection(db, fbc.EMPLOYEE_COLLECTION);

      const q = query(EmployeeReF,
        where(fbc.EMPLOYEE_MODULES, "array-contains", "SUBJECTMASTER"),
        where(fbc.EMPLOYEE_STATUS, "==", true),
        orderBy(fbc.EMPLOYEE_NAME));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allUsers.push({
          type: "EMPLOYEE",
          uid: doc.id,
          name: doc.data()[fbc.EMPLOYEE_NAME],
        });
      });
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }
    try {
      const TeacherReF = collection(db, fbc.TEACHER_COLLECTION);
      const q = query(TeacherReF,
        where(fbc.TEACHER_MODULES, "array-contains", "COURSEMASTER"),
        where(fbc.TEACHER_STATUS, "==", true),
        orderBy(fbc.TEACHER_NAME));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allUsers.push({
          type: "TEACHER",
          uid: doc.id,
          name: doc.data()[fbc.TEACHER_NAME],
        });
      });
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }
    setallUsers(allUsers)
    utility.hideloading();
  }

  useEffect(() => {

    if (
      (allUsers.length == 0)
    ) { return }
    var usersArray = []
    allUsers.map((user) => {
      usersArray.push({
        value: user.uid,
        customProperties: user,
        label: user.name
      })
    })

    setaccesschoices(
      new Choices($("#accessselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: true,
        resetScrollPosition: false,
        placeholderValue: "Select Multiple Users",
        classNames: {
          containerInner: "choices__inner rounded bg-light text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
          input: 'choices__input',
        },
        choices: usersArray,
      })
    );
    setkeywordchoices(
      new Choices($("#keywordsselect")[0], {
        removeItemButton: true,
        removeItems: true,
        editItems: true,
        classNames: {
          containerInner: "choices__inner rounded bg-light bg-input-user text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-xs",
          inputCloned: 'choices__input--cloned bg-light w-auto text-dark fw-bold text-sm mb-0 px-2',
          button: 'choices__button ms-1 me-0',
        },
      })
    );


  }, [allUsers])



  function initModal() {
    var element;
    var submitButton;
    var cancelButton;
    var closeButton;
    var form;
    var modal, thumbnailimgButton, deleteimagebutton;

    element = document.querySelector('#modal_addsubject');
    modal = new bootstrap.Modal(element);
    setSubjectModal(modal);
    submitButton = document.querySelector('#modal_addsubject_submit');
    cancelButton = document.querySelector('#modal_addsubject_cancel');
    closeButton = document.querySelector('#modal_addsubject_close');
    deleteimagebutton = document.querySelector('#deleteimagebutton');


    // var imageInputElement = document.querySelector("#kt_image_input_control");
    // var imageInput = new KTImageInput(imageInputElement);
    // imageInput.on("kt.imageinput.changed", function (e) {
    //   console.log("kt.imageinput.changed event is fired", $('.image-input-wrapper').css("background-image"));
    // });
    getAllCourses()
    thumbnailimgButton = document.querySelector('#changeimagebutton');
    thumbnailimgButton.addEventListener('click', function (e) {
      // e.preventDefault();
      let files = []
      let input = document.createElement('input');
      input.type = 'file';
      input.accept = '.png, .jpg, .jpeg';
      input.onchange = _ => {
        // you can use this method to get file and perform respective operations
        files = Array.from(input.files);
        var oFReader = new FileReader();
        oFReader.readAsDataURL(files[0]);

        oFReader.onload = function (oFREvent) {
          document.getElementById("thumbnailimg").src = oFREvent.target.result;
          setimageFile(() => {
            return files[0]
          })
          utility.showitem('deleteimagebutton', 'd-flex')
        };
      };
      input.click();



    });
    deleteimagebutton.addEventListener('click', function (e) {
      e.preventDefault();
      setimageFile(() => {
        return null
      })
      document.getElementById("thumbnailimg").src = subjectThumbnailURL
      utility.hideitem('deleteimagebutton')
    });
    closeButton.addEventListener('click', function (e) {
      setselectSubject(null)
      e.preventDefault();
      modal.hide();
    });
    cancelButton.addEventListener('click', function (e) {
      setselectSubject(null)
      e.preventDefault();
      modal.hide();
    });
  }

  function checkifDataisCorrect() {
    console.log(keywordchoices.getValue(true));
    $('.is-invalid').removeClass('is-invalid');
    var message = '';
    if (imageFile == null && selectSubject == null) {
      message = 'Please Select Subject Thumbnail';
      showsnackbar('error', message);
      return false;
    }
    else if (courseschoices.getValue(true).length == 0) {
      message = 'Please Select Course Applicable';
      courseschoices.showDropdown()
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('subjectcode')) {
      $('#subjectcode').addClass('is-invalid');
      message = 'Please Add Subject Code.';
      utility.showtippy('subjectcode', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('subjectname')) {
      $('#subjectname').addClass('is-invalid');
      message = 'Please Add Subject Name.';
      utility.showtippy('subjectname', message, 'danger');
      showsnackbar('error', message);
      return false;
    }
    else if (accesschoices.getValue(true).length == 0) {
      message = 'Please Provide Access To Atleast 01 User';
      accesschoices.showDropdown()
      showsnackbar('error', message);
      return false;
    }
    else if (keywordchoices.getValue(true).length == 0) {
      message = 'Please  Provide Access To Atleast 01 Keyword';
      utility.showtippy('keywordsselect', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else {
      return true;
    }
  }

  const addorUpdateSubject = async () => {
    if (checkifDataisCorrect()) {
      console.log(selectSubject !== null);
      console.log({ selectSubject });
      var subjectUID =
        selectSubject !== null
          ? selectSubject[fbc.SUBJECT_UID]
          : ulid();

      var subjectObj = {
        [fbc.SUBJECT_UID]: subjectUID,
        [fbc.SUBJECT_NAME]: utility.getinputValue('subjectname'),
        [fbc.SUBJECT_CODE]: utility.getinputValue('subjectcode'),
        [fbc.SUBJECT_COURSE]: courseschoices.getValue().customProperties.details,
        [fbc.SUBJECT_ACCESSUSERUIDARRAY]: accesschoices.getValue(true),
        [fbc.SUBJECT_KEYWORDS]: keywordchoices.getValue(true),
        [fbc.SUBJECT_STATUS]: $('#subjectstatusswitch').is(':checked'),
        [fbc.SUBJECT_HASASSESSMENTS]: $('#subjecthasasmtswitch').is(':checked'),
      };

      if (selectSubject == null) {
        subjectObj[fbc.SUBJECT_LESSONSUIDARRAY] = []
        subjectObj[fbc.SUBJECT_LESSONS] = {}
      }


      var uploadFiles = async function () {
        utility.showloading()
        var uploadRef = ref(
          storage,
          'Thumbnails/' + subjectUID + '/' + subjectUID + imageFile.name.split('.').pop().toLowerCase())


        uploadBytes(uploadRef, imageFile)
          .then(async (snapshot) => {
            getDownloadURL(snapshot.ref).then(async (downloadURL) => {
              subjectObj[fbc.SUBJECT_THUMBNAILURL] = downloadURL;
              uploadSubject()
            });
          })
          .catch((error) => {
            utility.hideloading();
            var message = 'Failed To Upload Image, ' + error.message
            showsnackbar('error', message);
          });
      };

      var uploadSubject = async () => {
        var log = {
          message: 'Subject ' + (selectSubject !== null ? 'Updated' : 'Added'),
          name: utility.get_keyvalue(USER_FULLNAME),
          uid: utility.get_keyvalue(USER_ID),
          date: utility.getDateandTime(),
          timestamp: utility.getTimestamp(),
        }
        console.log({ subjectObj });
        utility.showloading();

        var addorUpdateSubject = await RequestaddorUpdateSubject(subjectObj, log);
        utility.hideloading();
        if (addorUpdateSubject.status) {
          utility.success_alert(
            'Subject ' + (selectSubject !== null ? 'Updated' : 'Added'),
            'Details Added successfully.',
            'OKAY',
            utility.reloadPage,
            null
          );
        } else {
          var message = 'Failed To Add Subject, ' + addorUpdateSubject.message;
          showsnackbar('error', message);
        }
      }


      if (imageFile !== null) {
        uploadFiles()
      } else {
        uploadSubject()
      }


    }
  };
  return (
    <div
      data-backdrop="static" data-keyboard="false"
      className="modal fade"
      id="modal_addsubject"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl">
        <div className="modal-content">
          <div className="modal-header p-5" id="modal_addsubject_header">
            <h4 className="fw-bold">Add / Modify Subject</h4>

            <button
              onClick={(e) => clearAll()}
              id="modal_addsubject_close"
              className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
            >
              <span className="ri-close-line fs-1"></span>
            </button>
          </div>
          <div className="modal-body">
            <div className="fv-row mb-7 d-flex  flex-column mx-auto">
              <label className="fs-6 fw-semibold mb-4">
                <span className="required">Subject Thumbnail</span>
                <i
                  className="ri-information-line ms-1 fs-7"
                  data-bs-toggle="tooltip"
                  title="Subject Thumbnail"
                ></i>
              </label>
              <div className="w-auto image-input image-input-outline  w-125px h-125px"
                id='kt_image_input_control'>

                <img id="thumbnailimg" src={subjectThumbnailURL} className="image-input-wrapper   w-125px h-125px"></img>

                <label id="changeimagebutton" className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-30px h-30px bg-body shadow"
                  data-kt-image-input-action="change"
                  data-bs-toggle="tooltip"
                  data-bs-dismiss="click"
                  title="Change Image">
                  <i className="ri-pencil-fill fs-5"></i>
                </label>


                <span id="deleteimagebutton" className="d-none btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-30px h-30px bg-body shadow"
                  data-kt-image-input-action="remove"
                  data-bs-toggle="tooltip"
                  data-bs-dismiss="click"
                  title="Remove">
                  <i className="ri-delete-bin-6-fill fs-6 my-auto"></i>
                </span>

              </div>
            </div>

            <div className="row">

              <div className="fv-row mb-7 col-md-4">
                <label className="fs-6 fw-semibold mb-2">
                  <span className="required">Course</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"
                    title="Subject Belongs To This Course"
                  ></i>
                </label>

                <select id="courseselect" className="text-sm rounded form-control form-control-sm"></select>
              </div>
              <div className="fv-row mb-7 col-md-2">
                <label className="required fs-6 fw-semibold mb-2">
                  Subject Code
                </label>

                <input
                  id="subjectcode"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-6">
                <label className="required fs-6 fw-semibold mb-2">
                  Subject Name
                </label>

                <input
                  id="subjectname"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>



              <div className="fv-row mb-7 col-md-12">
                <label className="fs-6 fw-semibold mb-2">
                  <span className="required">Subject Access</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"
                    title="Selected User Can Make Changes."
                  ></i>
                </label>

                <select id="accessselect" multiple></select>
              </div>
              <div className="fv-row mb-7 col-md-12">
                <label className="fs-6 fw-semibold mb-2">
                  <span className="required">Subject Search Keywords</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"
                    title="For Subjects To Appear In Search Results"
                  ></i>
                </label>

                <input id="keywordsselect"
                  className="form-control fw-bold text-dark" />
              </div>
            </div>
            <div className="d-flex row g-9 my-4">
              <div className="col-md-4 fv-row m-0">
                <div className="d-flex flex-row  border p-2 rounded">
                  <label className="form-check form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                    <input
                      className="form-check-input ms-3"
                      name="subjectstatus"
                      type="checkbox"
                      value="1"
                      id="subjectstatusswitch"
                    />
                  </label>

                  <div className="me-5 border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="subjectstatusswitch"
                      className="fs-6 fw-semibold mb-0"
                    >
                      Subject Status
                      <br />
                      <span
                        id="subjectstatus_text"
                        className="fs-7 fw-semibold text-muted mb-0"
                      >
                        Subject In-Active
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-md-4 fv-row m-0">
                <div className="d-flex flex-row  border p-2 rounded">
                  <label className="form-check form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                    <input
                      className="form-check-input ms-3"
                      name="subjecthasasmt"
                      type="checkbox"
                      value="1"
                      id="subjecthasasmtswitch"
                    />
                  </label>

                  <div className="me-5 border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="subjecthasasmtswitch"
                      className="fs-6 fw-semibold mb-0"
                    >
                      Has Assessments?
                      <br />
                      <span
                        id="subjecthasasmt_text"
                        className="fs-7 fw-semibold text-muted mb-0"
                      >
                        Doesn&apos;t Have Assessments
                      </span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="modal-footer flex-end p-3">
            <button
              type="reset"
              onClick={(e) => clearAll()}
              id="modal_addsubject_cancel"
              className="btn py-2 btn-light me-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="modal_addsubject_submit"
              onClick={(e) => addorUpdateSubject()}
              className="btn py-2 btn-primary"
            >
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default AddorUpdateSubject;
