import { USER_FULLNAME, USER_ID } from '@/constants/appconstants';
import { db } from '@/firebase/firebaseconfig';
import { arrayUnion, doc, writeBatch } from 'firebase/firestore';
import $ from 'jquery';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { ulid } from 'ulid';
import * as fbc from '../../firebase/firebaseConstants';
import * as utility from '../../libraries/utility';

const AddorUpdateVideo = ({ addNewVideoDetails, selectedVideo, setVideoModal }) => {
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
    initModal();
  }, []);




  function clearAll() {
    $('.form-control').val('');
    $('#videoaccesstypeswitch').prop('checked', false).trigger('change');
    $('#youtubevideoswitch').prop('checked', false).trigger('change');

  }


  function initModal() {
    var element;
    var submitButton;
    var cancelButton;
    var closeButton;
    var form;
    var modal;

    element = document.querySelector('#modal_addvideo');
    modal = new bootstrap.Modal(element);
    setVideoModal(modal);
    submitButton = document.querySelector('#modal_addvideo_submit');
    cancelButton = document.querySelector('#modal_addvideo_cancel');
    closeButton = document.querySelector('#modal_addvideo_close');

    closeButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });
    cancelButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });

    $('#videoaccesstypeswitch').change(function () {
      if (this.checked) {
        $('#videoaccesstype_text').text('Video Is Paid');
      } else {
        $('#videoaccesstype_text').text('Video Is Free');
      }
    });
    $('#youtubevideoswitch').change(function () {
      if (this.checked) {
        $('#youtubevideo_text').text('Video is On Youtube');
      } else {
        $('#youtubevideo_text').text('Video is NOT On Youtube');
      }
    });
  }
  const getVimeoIdFromUrl = (url) => {
    // Look for a string with 'vimeo', then whatever, then a
    // forward slash and a group of digits.
    const match = /vimeo.*\/(\d+)/i.exec(url);
    // If the match isn't null (i.e. it matched)
    if (match) {
      // The grouped/matched digits from the regex
      return match[1];
    } else {
      return null;
    }
  };
  function checkifDataisCorrect() {
    $('.is-invalid').removeClass('is-invalid');

    var vimeoVideoID = getVimeoIdFromUrl(utility.getinputValue('videourl'))
    var message = '';

    if (addNewVideoDetails == null) {
      message = 'Failed To Proceed, Please Reload.';
      showsnackbar('error', message);
      return false;
    }
    else if (utility.isInputEmpty('videoheading')) {
      $('#videoheading').addClass('is-invalid');
      message = 'Please Add Heading.';
      utility.showtippy('videoheading', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('videodescription')) {
      $('#videodescription').addClass('is-invalid');
      message = 'Please Add Description.';
      utility.showtippy('videodescription', message, 'danger');
      showsnackbar('error', message);
      return false;
    }
    else if (utility.isInputEmpty('videourl')) {
      $('#videourl').addClass('is-invalid');
      message = 'Please Add Video URL.';
      utility.showtippy('videourl', message, 'danger');
      showsnackbar('error', message);
      return false;
    }
    else if ((vimeoVideoID == undefined || vimeoVideoID == null) && !$('#youtubevideoswitch').is(':checked')) {
      $('#videourl').addClass('is-invalid');
      message = 'Please Add Video URL Not Formated.';
      utility.showtippy('videourl', message, 'danger');
      showsnackbar('error', message);
      return false;
    }
    else {
      return true;
    }
  }

  const uploadVideo = async () => {
    if (checkifDataisCorrect()) {

      utility.info_alert(
        `Add Video Content.`,
        'Are you sure you want to continue.',
        'UPLOAD',
        'CANCEL',
        () => {
          uploadData()
        },
        null
      );



      var uploadData = async function () {
        utility.showloading()
        var contentUID = ulid()
        var log = {
          message: 'Video ' + (selectedVideo !== null ? 'Updated' : 'Added'),
          name: utility.get_keyvalue(USER_FULLNAME),
          uid: utility.get_keyvalue(USER_ID),
          date: utility.getDateandTime(),
          timestamp: utility.getTimestamp(),
        }

        var vimeoVideoID = getVimeoIdFromUrl(utility.getinputValue('videourl'))
        var videoURL = $('#youtubevideoswitch').is(':checked') ? utility.getinputValue('videourl') : "https://player.vimeo.com/video/" + vimeoVideoID
        var contentObj = {
          [fbc.CONTENT_UID]: contentUID,
          [fbc.CONTENT_HEADING]: utility.getinputValue('videoheading'),
          [fbc.CONTENT_DESCRIPTION]: utility.getinputValue('videodescription'),
          [fbc.CONTENT_ACCESSTYPE]: $('#videoaccesstypeswitch').is(':checked') ? "PAID" : "FREE",
          [fbc.CONTENT_ONYOUTUBE]: $('#youtubevideoswitch').is(':checked'),
          [fbc.CONTENT_COURSE]: addNewVideoDetails.course,
          [fbc.CONTENT_SUBJECT]: addNewVideoDetails.subject,
          [fbc.CONTENT_LESSON]: addNewVideoDetails.lesson,
          [fbc.CONTENT_STATUS]: true,
          [fbc.CONTENT_LOGS]: arrayUnion(log),
          [fbc.CONTENT_FILE]: {
            fileextenstion: ".url",
            filename: "",
            mime: "video/url",
            url: videoURL
          },
        };

        const batch = writeBatch(db)
        const contentRef = doc(db, fbc.CONTENT_COLLECTION, contentUID)
        const lessonRef = doc(db, fbc.LESSON_COLLECTION, addNewVideoDetails.lesson.uid)

        let lessonVideoDetails = {
          [fbc.CONTENT_UID]: contentUID,
          [fbc.CONTENT_HEADING]: utility.getinputValue('videoheading'),
          [fbc.CONTENT_DESCRIPTION]: utility.getinputValue('videodescription'),
          [fbc.CONTENT_ACCESSTYPE]: $('#videoaccesstypeswitch').is(':checked') ? "PAID" : "FREE",
          [fbc.CONTENT_ONYOUTUBE]: $('#youtubevideoswitch').is(':checked') ? "PAID" : "FREE",
          [fbc.CONTENT_FILE]: {
            fileextenstion: ".url",
            filename: "",
            mime: "video/url",
            url: videoURL
          }
        }

        batch.set(contentRef, contentObj)
        batch.set(lessonRef, {
          [fbc.LESSON_CONTENT]: {
            [contentUID]: lessonVideoDetails
          }
        }, { merge: true })
        await batch.commit();
        utility.hideloading()
        utility.success_alert(
          'Video Content Added.',
          'Details Added successfully.',
          'OKAY',
          (() => {
            $(`#content_tabbtn_${addNewVideoDetails.lesson.uid}`).click()
            $(`#modal_addvideo_close`).click()
          }),
          null
        );
      }

    }
  };
  return (
    <div
      data-backdrop="static" data-keyboard="false"
      className="modal fade"
      id="modal_addvideo"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl">
        <div className="modal-content">
          <div className="modal-header p-5" id="modal_addvideo_header">
            <h4 className="fw-bold">Add / Modify Video For {addNewVideoDetails?.lesson.name}</h4>

            <button
              onClick={(e) => clearAll()}
              id="modal_addvideo_close"
              className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
            >
              <span className="ri-close-line fs-1"></span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row align-items-end d-flex">

              <div className="fv-row mb-7 col-md-4">
                <label className="required fs-6 fw-semibold mb-2">
                  Video Heading
                </label>

                <input
                  id="videoheading"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-8">
                <label className="required fs-6 fw-semibold mb-2">
                  Video Short Description
                </label>

                <input
                  id="videodescription"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="fv-row mb-7 col-md-12">
                <label className="required fs-6 fw-semibold mb-2">
                  Video URL
                </label>

                <input
                  id="videourl"
                  type="text"
                  className="form-control fw-bold text-dark"
                  placeholder=""
                />
              </div>
              <div className="col-md-4 fv-row m-0">
                <label className="required fs-6 fw-semibold mb-2">
                  Video Access
                </label>
                <div className="d-flex flex-row  border p-2 rounded">
                  <label className="form-check  form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                    <input
                      className="form-check-input ms-3"
                      name="accesstype"
                      type="checkbox"
                      value="1"
                      id="videoaccesstypeswitch"
                    />
                  </label>

                  <div className="me-5  border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="videoaccesstypeswitch"
                      id="videoaccesstype_text"
                      className="fs-6 fw-semibold border-0 px-0 form-control mb-0"
                    >

                      Video is Free
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-md-4 fv-row m-0">
                <label className="required fs-6 fw-semibold mb-2">
                  Youtube Video
                </label>
                <div className="d-flex flex-row  border p-2 rounded">
                  <label className="form-check  form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                    <input
                      className="form-check-input ms-3"
                      name="accesstype"
                      type="checkbox"
                      value="1"
                      id="youtubevideoswitch"
                    />
                  </label>

                  <div className="me-5  border-start border-1 border-secondary ps-4">
                    <label
                      htmlFor="youtubevideoswitch"
                      id="youtubevideo_text"
                      className="fs-6 fw-semibold border-0 px-0 form-control mb-0"
                    >

                      Video is On Youtube
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
              id="modal_addvideo_cancel"
              className="btn py-2 btn-light me-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="modal_addvideo_submit"
              onClick={(e) => uploadVideo()}
              className="btn py-2 btn-primary"
            >
              <span>Save Video</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddorUpdateVideo;
