import { USER_FULLNAME, USER_ID } from '@/constants/appconstants';
import { db, storage } from '@/firebase/firebaseconfig';
import { arrayUnion, doc, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import $ from 'jquery';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { ulid } from 'ulid';
import { SUPPORTEDMIMETYPES } from '../../constants/acceptedFileMIMETypes';
import * as fbc from '../../firebase/firebaseConstants';
import * as utility from '../../libraries/utility';
var formatFileNames = [];
var formatFiles = [];
const AddorUpdateContent = ({ addNewContentDetails, selectedContent, setContentModal }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
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
    browseMultipleFiles();
    initModal();
  }, []);




  function clearAll() {
    $('.form-control').val('');
    $('#fileselect')[0].value = null;
    formatFileNames = [];
    formatFiles = [];
    $('#accesstypeswitch').prop('checked', false).trigger('change');

  }

  function browseMultipleFiles() {
    $('#fileselect').on('change', function () {
      var allFiles = Array.from($('#fileselect')[0].files);

      var SUPPORTEDMIMETYPESArray = []
      Object.keys(SUPPORTEDMIMETYPES).map(key => {
        SUPPORTEDMIMETYPESArray.push(key)
      })

      if (allFiles.length > 1) {
        var message = 'Please Select Max 1 File.';
        utility.showtippy('fileselect', message, 'danger');
        showsnackbar('error', message);
        $('#fileselect')[0].value = null;
        return;
      }


      allFiles.map((file) => {
        var message = ""
        if (!formatFileNames.includes(file.name)) {
          var fileSize = file.size; // in bytes
          if (fileSize > 1e7) {
            message = 'Please Select Max 10MB File, ' + file.name;
            utility.showtippy('fileselect', message, 'danger');
            showsnackbar('error', message);
            $('#fileselect')[0].value = null;
            return false;
          } else if (!SUPPORTEDMIMETYPESArray.includes(file.name.split('.').pop().toLowerCase())) {
            message = 'Invalid File Format, ' + file.name;
            utility.showtippy('fileselect', message, 'danger');
            showsnackbar('error', message);
            $('#fileselect')[0].value = null;
            return false;
          } else {
            formatFileNames.push(file.name);
            formatFiles.push({
              fileextenstion: file.name.split('.').pop().toLowerCase(),
              mime: SUPPORTEDMIMETYPES[file.name.split('.').pop().toLowerCase()],
              filename: file.name,
              file: file,
            });
          }
        }
      });


      formatFiles.sort(function (x, y) {
        let a = x.filename,
          b = y.filename;
        return a == b ? 0 : a > b ? 1 : -1;
      });

      formatFileNames.sort(function (x, y) {
        let a = x,
          b = y;
        return a == b ? 0 : a > b ? 1 : -1;
      });
      refereshFileDiv()
      console.log(formatFiles);
      console.log(formatFileNames);
    });
  }

  function refereshFileDiv() {
    $("#filesselecteddiv").empty()
    formatFiles.map((file, index) => {

      var item = ` <div class="d-flex flex-row bg-white border rounded py-2 px-5 w-100 justify-content-between mb-2">

          <div class="d-flex flex-column">

            <span class="fs-5 fw-bold">${file.filename}</span>

            <span class="text-xs text-muted">File Type: ${file.mime}</span>
          </div>


          <div class='d-flex flex-row gap-2 py-2'>
           
            <button id="${index}_remove" class="btn text-xs px-2 py-1 btn-sm btn-secondary">
              <i class="ri-delete-bin-6-fill fs-5"></i>
              Remove
            </button>
          </div>

        </div>`

      $("#filesselecteddiv").append(item)
      $(`#${index}_remove`).on('click', function (e) {
        e.preventDefault();
        removeFileFromList(Number(this.id.replaceAll("_remove", "")));
      });
    })

    $('#fileselect')[0].value = null;
  }

  function removeFileFromList(index) {
    formatFileNames.splice(index, 1)
    formatFiles.splice(index, 1)
    console.log(formatFiles);
    console.log(formatFileNames);
    refereshFileDiv()
  }

  function initModal() {
    var element;
    var submitButton;
    var cancelButton;
    var closeButton;
    var form;
    var modal;

    element = document.querySelector('#modal_addcontent');
    modal = new bootstrap.Modal(element);
    setContentModal(modal);
    submitButton = document.querySelector('#modal_addcontent_submit');
    cancelButton = document.querySelector('#modal_addcontent_cancel');
    closeButton = document.querySelector('#modal_addcontent_close');

    closeButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });
    cancelButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });

    $('#accesstypeswitch').change(function () {
      if (this.checked) {
        $('#accesstype_text').text('Content Is Paid');
      } else {
        $('#accesstype_text').text('Content Is Free');
      }
    });
  }

  function checkifDataisCorrect() {
    $('.is-invalid').removeClass('is-invalid');
    var message = '';

    if (addNewContentDetails == null) {
      message = 'Failed To Proceed, Please Reload.';
      showsnackbar('error', message);
      return false;
    }
    else if (utility.isInputEmpty('heading')) {
      $('#heading').addClass('is-invalid');
      message = 'Please Add Heading.';
      utility.showtippy('heading', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('description')) {
      $('#description').addClass('is-invalid');
      message = 'Please Add Description.';
      utility.showtippy('description', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (formatFiles.length == 0) {
      message = 'Please Select At Least 01 File.';
      utility.showtippy('fileselect', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else {
      return true;
    }
  }

  const uploadContent = async () => {
    if (checkifDataisCorrect()) {

      utility.info_alert(
        `Upload ${formatFiles.length} Files.`,
        'Are you sure you want to continue.',
        'UPLOAD',
        'CANCEL',
        () => {
          utility.showloading();
          utility.updateloadingstatus('Uploading Files');
          uploadFiles(0);
        },
        null
      );

      var fileURLs = []

      var uploadFiles = async function (index) {

        var file = formatFiles[index].file;
        var filename = formatFiles[index].filename;
        formatFiles.map((filedetails) => {
          file = filedetails.file;
        });
        var uploadRef = ref(
          storage,
          'Content/' + addNewContentDetails.course.uid + '/' + addNewContentDetails.subject.uid + '/' + addNewContentDetails.lesson.uid + '/' + filename
        );

        uploadBytes(uploadRef, file)
          .then(async (snapshot) => {
            getDownloadURL(snapshot.ref).then(async (downloadURL) => {

              fileURLs.push({
                ...formatFiles[index],
                url: downloadURL,
              });


              await uploadData(index, downloadURL);

              if (fileURLs.length === formatFiles.length) {
                utility.hideloading();
                utility.success_alert(
                  'Content Uploaded Successfully.',
                  'Details Added successfully.',
                  'OKAY',
                  (() => {
                    $(`#content_tabbtn_${addNewContentDetails.lesson.uid}`).click()
                    $(`#modal_addcontent_close`).click()
                  }),
                  null
                );
              } else {


                utility.updateloadingstatus((index + 1) + "/" + (formatFiles.length) + ' Files Uploaded');

                uploadFiles(index + 1);
              }
            });
          })
          .catch((error) => {
            utility.hideloading();
            var message =
              'Failed To Upload File : ' + filename + ', ' + error.message;
            showsnackbar('error', message);
          });
      };


      var uploadData = async function (index, url) {

        var contentUID = ulid()
        var log = {
          message: 'Content ' + (selectedContent !== null ? 'Updated' : 'Added'),
          name: utility.get_keyvalue(USER_FULLNAME),
          uid: utility.get_keyvalue(USER_ID),
          date: utility.getDateandTime(),
          timestamp: utility.getTimestamp(),
        }

        var filedetails = formatFiles[index]
        delete filedetails["file"];

        var contentObj = {
          [fbc.CONTENT_UID]: contentUID,
          [fbc.CONTENT_HEADING]: utility.getinputValue('heading'),
          [fbc.CONTENT_DESCRIPTION]: utility.getinputValue('description'),
          [fbc.CONTENT_ACCESSTYPE]: $('#accesstypeswitch').is(':checked') ? "PAID" : "FREE",
          [fbc.CONTENT_COURSE]: addNewContentDetails.course,
          [fbc.CONTENT_SUBJECT]: addNewContentDetails.subject,
          [fbc.CONTENT_LESSON]: addNewContentDetails.lesson,
          [fbc.CONTENT_STATUS]: true,
          [fbc.CONTENT_LOGS]: arrayUnion(log),
          [fbc.CONTENT_FILE]: {
            ...filedetails,
            url
          },
        };

        const batch = writeBatch(db)
        const contentRef = doc(db, fbc.CONTENT_COLLECTION, contentUID)
        const lessonRef = doc(db, fbc.LESSON_COLLECTION, addNewContentDetails.lesson.uid)

        let lessonContentDetails = {
          [fbc.CONTENT_UID]: contentUID,
          [fbc.CONTENT_HEADING]: utility.getinputValue('heading'),
          [fbc.CONTENT_DESCRIPTION]: utility.getinputValue('description'),
          [fbc.CONTENT_ACCESSTYPE]: $('#accesstypeswitch').is(':checked') ? "PAID" : "FREE",
          [fbc.CONTENT_FILE]: {
            ...filedetails,
            url
          }
        }

        batch.set(contentRef, contentObj)
        batch.set(lessonRef, {
          [fbc.LESSON_CONTENT]: {
            [contentUID]: lessonContentDetails
          }
        }, { merge: true })
        await batch.commit();
        return true;
      }

    }
  };
  return (
    <div
      data-backdrop="static" data-keyboard="false"
      className="modal fade"
      id="modal_addcontent"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl">
        <div className="modal-content">
          <div className="modal-header p-5" id="modal_addcontent_header">
            <h4 className="fw-bold">Add / Modify Content For {addNewContentDetails?.lesson.name}</h4>

            <button
              onClick={(e) => clearAll()}
              id="modal_addcontent_close"
              className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
            >
              <span className="ri-close-line fs-1"></span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row align-items-end d-flex">

              <div className="fv-row mb-7 col-md-4">
                <label className="required fs-6 fw-semibold mb-2">
                  Content Heading
                </label>

                <input
                  id="heading"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-8">
                <label className="required fs-6 fw-semibold mb-2">
                  Content Short Description
                </label>

                <input
                  id="description"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-4">
                <label className="required fs-6 fw-semibold mb-2">
                  Select Content Files
                </label>

                <input
                  id="fileselect"
                  type="file"
                  accept={Object.keys(SUPPORTEDMIMETYPES).map(key => { return "." + key })}
                  title="Single File Max 10MB."
                  className="form-control fw-bold text-dark"
                  placeholder=""

                />
              </div>
              <div className="col-md-4 fv-row m-0">
                <label className="required fs-6 fw-semibold mb-2">
                  Content Access
                </label>
                <div className="d-flex flex-row  border p-2 rounded">
                  <label className="form-check  form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                    <input
                      className="form-check-input ms-3"
                      name="accesstype"
                      type="checkbox"
                      value="1"
                      id="accesstypeswitch"
                    />
                  </label>

                  <div className="me-5  border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="accesstypeswitch"
                      id="accesstype_text"
                      className="fs-6 fw-semibold border-0 px-0 form-control mb-0"
                    >

                      Content is Free
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex row g-9 my-4">


            </div>

            <div id="filesselecteddiv" className="d-flex row px-3 my-4">


            </div>

          </div>

          <div className="modal-footer flex-end p-3">
            <button
              type="reset"
              onClick={(e) => clearAll()}
              id="modal_addcontent_cancel"
              className="btn py-2 btn-light me-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="modal_addcontent_submit"
              onClick={(e) => uploadContent()}
              className="btn py-2 btn-primary"
            >
              <span>Upload Content</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddorUpdateContent;
