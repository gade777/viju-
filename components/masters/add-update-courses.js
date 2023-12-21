import { USER_FULLNAME, USER_ID } from '@/constants/appconstants';
import { db, storage } from '@/firebase/firebaseconfig';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import $ from 'jquery';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ulid } from 'ulid';
import * as fbc from '../../firebase/firebaseConstants';
import { RequestaddorUpdateCourse } from '../../firebase/masterAPIS';
import * as utility from '../../libraries/utility';
const AddorUpdateCourse = ({ setselectCourse, selectCourse, setCourseModal, allBoardDocs }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [courseThumbnailURL, setcourseThumbnailURL] = useState("https://placehold.co/200");
  const [imageFile, setimageFile] = useState(null);
  const [selectedModules, setselectedModules] = useState([]);
  const [accesschoices, setaccesschoices] = useState(null);
  const [keywordchoices, setkeywordchoices] = useState(null);
  const [boardchoices, setBoardschoices] = useState(null);
  const [courseColorchoices, setCourseColorchoices] = useState(null);
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
    $('#coursestatusswitch').change(function () {
      if (this.checked) {
        $('#coursestatus_text').text('Course Active');
      } else {
        $('#coursestatus_text').text('Course In-Active');
      }
    });


    initModal();
  }, []);

  useEffect(() => {
    console.log({ selectCourse });
    if (selectCourse == null) {
      return;
    }
    $('#coursename').val(selectCourse[fbc.COURSE_NAME]);
    $('#coursecode').val(selectCourse[fbc.COURSE_CODE]);
    boardchoices.setChoiceByValue(selectCourse[fbc.COURSE_BOARD].uid);
    courseColorchoices.setChoiceByValue(selectCourse[fbc.COURSE_COLOR]);
    $('#coursefield').val(selectCourse[fbc.COURSE_FIELD]);
    setcourseThumbnailURL(selectCourse[fbc.COURSE_THUMBNAILURL])
    keywordchoices.setValue(selectCourse[fbc.COURSE_KEYWORDS]);
    accesschoices.setChoiceByValue(selectCourse[fbc.COURSE_ACCESSUSERUIDARRAY]);

    $('#coursestatusswitch')
      .prop('checked', selectCourse[fbc.COURSE_STATUS])
      .trigger('change');


  }, [selectCourse]);


  useEffect(() => {
    if (allBoardDocs.length == 0) {
      return
    }
    var boardsArray = [
      { value: "", label: "Select Course", placeholder: true, disabled: true, selected: true },]
    allBoardDocs.map((board) => {
      boardsArray.push({
        value: board.uid,
        customProperties: board,
        label: board.name
      })
    })
    console.log({ boardsArray });
    setBoardschoices(
      new Choices($("#addcourseboardselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: true,
        resetScrollPosition: false,
        placeholderValue: "",
        classNames: {
          containerInner: "choices__inner bg-white rounded  text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
        },
        choices: boardsArray,
      })
    );

    var colorsArray = [
      { value: "", label: "Select Color", placeholder: true, disabled: true, selected: true },

    ]

    Object.keys(fbc.COURSECOLORS).map((key) => {
      colorsArray.push({
        value: key,
        label: key
      })
    })
    setCourseColorchoices(
      new Choices($("#addcoursecolorselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: true,
        resetScrollPosition: false,
        placeholderValue: "",
        classNames: {
          containerInner: "choices__inner bg-white rounded  text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
        },
        choices: colorsArray,
      })
    );
  }, [allBoardDocs])



  function clearAll() {
    $('.form-control').val('');
    $('#coursestatusswitch').prop('checked', false).trigger('change');
    // console.log(keywordchoices.getValue(true));
    courseColorchoices.removeActiveItems()
    boardchoices.removeActiveItems()
    accesschoices.removeActiveItems()
    keywordchoices.removeActiveItems()
    keywordchoices.removeHighlightedItems()
    setselectCourse(null)
    setcourseThumbnailURL("https://placehold.co/200")
    setimageFile(() => {
      return null
    })
  }


  async function getAllUsers() {
    var allUsers = [];
    utility.showloading();
    try {
      const EmployeeReF = collection(db, fbc.EMPLOYEE_COLLECTION);

      const q = query(EmployeeReF,
        where(fbc.EMPLOYEE_MODULES, "array-contains", "COURSEMASTER"),
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
          containerInner: "choices__inner text-dark fw-bold text-sm",
          item: "choices__item pe-2 text-sm",
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
          containerInner: "choices__inner bg-input-user text-dark fw-bold text-sm",
          item: "choices__item pe-2 text-xs",
          inputCloned: 'choices__input--cloned w-auto text-dark fw-bold text-sm',
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

    element = document.querySelector('#modal_addcourse');
    modal = new bootstrap.Modal(element);
    setCourseModal(modal);
    submitButton = document.querySelector('#modal_addcourse_submit');
    cancelButton = document.querySelector('#modal_addcourse_cancel');
    closeButton = document.querySelector('#modal_addcourse_close');
    thumbnailimgButton = document.querySelector('#changeimagebutton');
    deleteimagebutton = document.querySelector('#deleteimagebutton');




    getAllUsers()
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
      document.getElementById("thumbnailimg").src = courseThumbnailURL
      utility.hideitem('deleteimagebutton')
    });
    closeButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });
    cancelButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });
  }

  function checkifDataisCorrect() {
    console.log(keywordchoices.getValue(true));
    $('.is-invalid').removeClass('is-invalid');
    var message = '';
    if (imageFile == null && selectCourse == null) {
      message = 'Please Select Thumbnail';
      showsnackbar('error', message);
      return false;
    }
    else if (utility.isInputEmpty('coursename')) {
      $('#coursename').addClass('is-invalid');
      message = 'Please Add Course Name.';
      utility.showtippy('coursename', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('coursecode')) {
      $('#coursecode').addClass('is-invalid');
      message = 'Please Add Course Code.';
      utility.showtippy('coursecode', message, 'danger');
      showsnackbar('error', message);
      return false;
    }
    else if (courseColorchoices.getValue(true).length == 0) {
      message = 'Please Add Course Color.';
      courseColorchoices.showdropdown()
      showsnackbar('error', message);
      return false;
    }
    else if (boardchoices.getValue(true).length == 0) {
      message = 'Please Add Course Board.';
      boardchoices.showdropdown()
      showsnackbar('error', message);
      return false;
    }
    else if (utility.isInputEmpty('coursefield')) {
      $('#coursefield').addClass('is-invalid');
      message = 'Please Add Course Field.';
      utility.showtippy('coursefield', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (accesschoices.getValue(true).length == 0) {
      message = 'Please Provide Access To Atleast 01 User';
      accesschoices.showdropdown()
      showsnackbar('error', message);
      return false;
    } else if (keywordchoices.getValue(true).length == 0) {
      message = 'Please  Provide Access To Atleast 01 Keyword';
      keywordchoices.showdropdown()
      showsnackbar('error', message);
      return false;
    } else {
      return true;
    }
  }

  const addorUpdateCourse = async () => {
    if (checkifDataisCorrect()) {
      console.log(selectCourse !== null);
      console.log({ selectCourse });
      var courseUID =
        selectCourse !== null
          ? selectCourse[fbc.COURSE_UID]
          : ulid();

      var courseObj = {
        [fbc.COURSE_UID]: courseUID,
        [fbc.COURSE_NAME]: utility.getinputValue('coursename'),
        [fbc.COURSE_CODE]: utility.getinputValue('coursecode'),
        [fbc.COURSE_FIELD]: utility.getinputValue('coursefield'),
        [fbc.COURSE_COLOR]: courseColorchoices.getValue(true),
        [fbc.COURSE_BOARD]: boardchoices.getValue().customProperties.details,
        [fbc.COURSE_ACCESSUSERUIDARRAY]: accesschoices.getValue(true),
        [fbc.COURSE_KEYWORDS]: keywordchoices.getValue(true),
        [fbc.COURSE_STATUS]: $('#coursestatusswitch').is(':checked'),
      };

      var uploadFiles = async function () {
        utility.showloading()
        var uploadRef = ref(
          storage,
          'Thumbnails/' + courseUID + '/' + courseUID + imageFile.name.split('.').pop().toLowerCase())


        uploadBytes(uploadRef, imageFile)
          .then(async (snapshot) => {
            getDownloadURL(snapshot.ref).then(async (downloadURL) => {
              courseObj[fbc.COURSE_THUMBNAILURL] = downloadURL;
              uploadCourse()
            });
          })
          .catch((error) => {
            utility.hideloading();
            var message = 'Failed To Upload Image, ' + error.message
            showsnackbar('error', message);
          });
      };


      var uploadCourse = async () => {
        var log = {
          message: 'Course ' + (selectCourse !== null ? 'Updated' : 'Added'),
          name: utility.get_keyvalue(USER_FULLNAME),
          uid: utility.get_keyvalue(USER_ID),
          date: utility.getDateandTime(),
          timestamp: utility.getTimestamp(),
        }
        console.log({ courseObj });
        utility.showloading();

        var addorUpdateCourse = await RequestaddorUpdateCourse(courseObj, log);
        utility.hideloading();
        if (addorUpdateCourse.status) {
          utility.success_alert(
            'Course ' + (selectCourse !== null ? 'Updated' : 'Added'),
            'Details Added successfully.',
            'OKAY',
            utility.reloadPage,
            null
          );
        } else {
          var message = 'Failed To Add Course, ' + addorUpdateCourse.message;
          showsnackbar('error', message);
        }
      }


      if (imageFile !== null) {
        uploadFiles()
      } else {
        uploadCourse()
      }
    }
  };
  return (
    <div
      data-backdrop="static" data-keyboard="false"
      className="modal fade"
      id="modal_addcourse"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl">
        <div className="modal-content">
          <div className="modal-header p-5" id="modal_addcourse_header">
            <h4 className="fw-bold">Add / Modify Course</h4>

            <button
              onClick={(e) => clearAll()}
              id="modal_addcourse_close"
              className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
            >
              <span className="ri-close-line fs-1"></span>
            </button>
          </div>

          <div className="modal-body">

            <div className="fv-row mb-7 d-flex  flex-column mx-auto">
              <label className="fs-6 fw-semibold mb-4">
                <span className="required">Course Thumbnail</span>
                <i
                  className="ri-information-line ms-1 fs-7"
                  data-bs-toggle="tooltip"
                  title="Subject Thumbnail"
                ></i>
              </label>
              <div className="w-auto image-input image-input-outline  w-125px h-125px"
                id='kt_image_input_control'>

                <img id="thumbnailimg" src={courseThumbnailURL} className="image-input-wrapper   w-125px h-125px"></img>

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
              <div className="fv-row mb-7 col-md-3">
                <label className="required fs-6 fw-semibold mb-2">
                  Course Code
                </label>

                <input
                  id="coursecode"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-6">
                <label className="required fs-6 fw-semibold mb-2">
                  Course Name
                </label>

                <input
                  id="coursename"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-3">
                <label className="required fs-6 fw-semibold mb-2">
                  Course Field
                </label>

                <input
                  id="coursefield"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-3">
                <label className="required fs-6 fw-semibold mb-2">
                  Course Colour
                </label>

                <select id="addcoursecolorselect"></select>

              </div>
              <div className="fv-row mb-7 col-md-3">
                <label className="required fs-6 fw-semibold mb-2">
                  Course Board
                </label>

                <select id="addcourseboardselect"></select>

              </div>


              <div className="fv-row mb-7 col-md-12">
                <label className="fs-6 fw-semibold mb-2">
                  <span className="required">Course Access</span>
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
                  <span className="required">Course Search Keywords</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"
                    title="For Courses To Appear In Search Results"
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
                      name="coursestatus"
                      type="checkbox"
                      value="1"
                      id="coursestatusswitch"
                    />
                  </label>

                  <div className="me-5 border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="coursestatusswitch"
                      className="fs-6 fw-semibold  mb-0"
                    >
                      Course Status
                      <br />
                      <span
                        id="coursestatus_text"
                        className="fs-7 fw-semibold text-muted"
                      >
                        Course In-Active
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
              id="modal_addcourse_cancel"
              className="btn py-2 btn-light me-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="modal_addcourse_submit"
              onClick={(e) => addorUpdateCourse()}
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

export default AddorUpdateCourse;
