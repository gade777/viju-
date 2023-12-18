import { USER_FULLNAME, USER_ID } from '@/constants/appconstants';
import { storage } from '@/firebase/firebaseconfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import $ from 'jquery';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ulid } from 'ulid';
import * as fbc from '../../firebase/firebaseConstants';
import { RequestaddorUpdateLesson } from '../../firebase/masterAPIS';
import * as utility from '../../libraries/utility';
const AddorUpdateLesson = ({ addNewLessonDetails, selectedLesson, setLessonModal }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [keywordchoices, setkeywordchoices] = useState(null);
  const [lessonThumbnailURL, setlessonThumbnailURL] = useState("https://placehold.co/200");
  const [imageFile, setimageFile] = useState(null);

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
    $('#lessonstatusswitch').change(function () {
      if (this.checked) {
        $('#lessonstatus_text').text('Lesson Active');
      } else {
        $('#lessonstatus_text').text('Lesson In-Active');
      }
    });

    var accesstypeArray = [
      { value: "", label: "Select", placeholder: true, disabled: true, selected: true },
      { value: "FREE", label: "Free", },
      { value: "PAID", label: "Paid", },
    ]

    console.log({ accesstypeArray });

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
    initModal();
  }, []);

  useEffect(() => {
    console.log({ selectedLesson });
    if (selectedLesson == null) {
      return;
    }
    $('#lessonname').val(selectedLesson[fbc.LESSON_NAME]);
    $('#lessoncode').val(selectedLesson[fbc.LESSON_CODE]);
    keywordchoices.setValue(selectedLesson[fbc.LESSON_KEYWORDS]);
    setlessonThumbnailURL(selectedLesson[fbc.LESSON_THUMBNAILURL])

    $('#lessonstatusswitch')
      .prop('checked', selectedLesson[fbc.LESSON_STATUS])
      .trigger('change');


  }, [selectedLesson]);


  function clearAll() {
    $('.form-control').val('');
    $('#lessonstatusswitch').prop('checked', false).trigger('change');

    keywordchoices.removeActiveItems()
    keywordchoices.removeHighlightedItems()
    setlessonThumbnailURL("https://placehold.co/200")
    setimageFile(() => {
      return null
    })
  }




  function initModal() {
    var element;
    var submitButton;
    var cancelButton;
    var closeButton;
    var form;
    var modal, thumbnailimgButton, deleteimagebutton;

    element = document.querySelector('#modal_addlesson');
    modal = new bootstrap.Modal(element);
    setLessonModal(modal);
    submitButton = document.querySelector('#modal_addlesson_submit');
    cancelButton = document.querySelector('#modal_addlesson_cancel');
    closeButton = document.querySelector('#modal_addlesson_close');
    thumbnailimgButton = document.querySelector('#changeimagebutton');
    deleteimagebutton = document.querySelector('#deleteimagebutton');

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
      document.getElementById("thumbnailimg").src = lessonThumbnailURL
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
    $('.is-invalid').removeClass('is-invalid');
    var message = '';

    if (imageFile == null && selectedLesson == null) {
      message = 'Please Select Lesson Thumbnail';
      showsnackbar('error', message);
      return false;
    }
    else if (addNewLessonDetails == null && selectedLesson == null) {
      message = 'Failed To Proceed, Please Reload.';
      showsnackbar('error', message);
      return false;
    }
    else if (utility.isInputEmpty('lessoncode')) {
      $('#lessoncode').addClass('is-invalid');
      message = 'Please Add Lesson Code.';
      utility.showtippy('lessoncode', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('lessonname')) {
      $('#lessonname').addClass('is-invalid');
      message = 'Please Add Lesson Name.';
      utility.showtippy('lessonname', message, 'danger');
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

  const addorUpdateLesson = async () => {
    if (checkifDataisCorrect()) {
      console.log(selectedLesson !== null);
      console.log({ selectedLesson });
      var lessonUID =
        selectedLesson !== null
          ? selectedLesson[fbc.LESSON_UID]
          : ulid();

      var lessonObj = {
        [fbc.LESSON_UID]: lessonUID,
        [fbc.LESSON_NAME]: utility.getinputValue('lessonname'),
        [fbc.LESSON_CODE]: utility.getinputValue('lessoncode'),
        [fbc.LESSON_KEYWORDS]: keywordchoices.getValue(true),
        [fbc.LESSON_STATUS]: $('#lessonstatusswitch').is(':checked'),
      };



      var uploadFiles = async function () {
        utility.showloading()
        var uploadRef = ref(
          storage,
          'Thumbnails/' + lessonUID + '/' + lessonUID + imageFile.name.split('.').pop().toLowerCase())


        uploadBytes(uploadRef, imageFile)
          .then(async (snapshot) => {
            getDownloadURL(snapshot.ref).then(async (downloadURL) => {
              lessonObj[fbc.LESSON_THUMBNAILURL] = downloadURL;
              uploadLesson()
            });
          })
          .catch((error) => {
            utility.hideloading();
            var message = 'Failed To Upload Image, ' + error.message
            showsnackbar('error', message);
          });
      };

      if (selectedLesson == null) {
        lessonObj[fbc.LESSON_COURSE] = addNewLessonDetails.course
        lessonObj[fbc.LESSON_SUBJECT] = addNewLessonDetails.subject
        lessonObj[fbc.LESSON_CONTENT] = {}
        lessonObj[fbc.LESSON_ASSESMENTUIDARRAY] = {}
      }
      var uploadLesson = async () => {
        var log = {
          message: 'Lesson ' + (selectedLesson !== null ? 'Updated' : 'Added'),
          name: utility.get_keyvalue(USER_FULLNAME),
          uid: utility.get_keyvalue(USER_ID),
          date: utility.getDateandTime(),
          timestamp: utility.getTimestamp(),
        }
        console.log({ lessonObj });
        utility.showloading();

        var addorUpdateLesson = await RequestaddorUpdateLesson(lessonObj, log);
        utility.hideloading();
        if (addorUpdateLesson.status) {
          utility.success_alert(
            'Lesson ' + (selectedLesson !== null ? 'Updated' : 'Added'),
            'Details Added successfully.',
            'OKAY',
            utility.reloadPage,
            null
          );
        } else {
          var message = 'Failed To Add Lesson, ' + addorUpdateLesson.message;
          showsnackbar('error', message);
        }
      }

      if (imageFile !== null) {
        uploadFiles()
      } else {
        uploadLesson()
      }


    }
  };
  return (
    <div
      data-backdrop="static" data-keyboard="false"
      className="modal fade"
      id="modal_addlesson"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl">
        <div className="modal-content">
          <div className="modal-header p-5" id="modal_addlesson_header">
            <h4 className="fw-bold">Add / Modify Lesson</h4>

            <button
              onClick={(e) => clearAll()}
              id="modal_addlesson_close"
              className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
            >
              <span className="ri-close-line fs-1"></span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="fv-row mb-7 d-flex  flex-column mx-auto">
                <label className="fs-6 fw-semibold mb-4">
                  <span className="required">Lesson Thumbnail</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"
                    title="Lesson Thumbnail"
                  ></i>
                </label>
                <div className="w-auto image-input image-input-outline  w-125px h-125px"
                  id='kt_image_input_control'>

                  <img id="thumbnailimg" src={lessonThumbnailURL} className="image-input-wrapper   w-125px h-125px"></img>

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
              <div className="fv-row mb-7 col-md-2">
                <label className="required fs-6 fw-semibold mb-2">
                  Lesson Code
                </label>

                <input
                  id="lessoncode"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-10">
                <label className="required fs-6 fw-semibold mb-2">
                  Lesson Name
                </label>

                <input
                  id="lessonname"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-12">
                <label className="fs-6 fw-semibold mb-2">
                  <span className="required">Lesson Search Keywords</span>
                  <i
                    className="ri-information-line ms-1 fs-7"
                    data-bs-toggle="tooltip"
                    title="For Lessons To Appear In Search Results"
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
                      name="lessonstatus"
                      type="checkbox"
                      value="1"
                      id="lessonstatusswitch"
                    />
                  </label>

                  <div className="me-5 border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="lessonstatusswitch"
                      className="fs-6 fw-semibold mb-0"
                    >
                      Lesson Status
                      <br />
                      <span
                        id="lessonstatus_text"
                        className="fs-7 fw-semibold text-muted mb-0"
                      >
                        Lesson In-Active
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
              id="modal_addlesson_cancel"
              className="btn py-2 btn-light me-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="modal_addlesson_submit"
              onClick={(e) => addorUpdateLesson()}
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

export default AddorUpdateLesson;
