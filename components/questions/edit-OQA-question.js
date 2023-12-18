import { USER_FULLNAME, USER_ID } from '@/constants/appconstants';
import {
  LESSON_COLLECTION, LESSON_COURSE, LESSON_NAME, LESSON_SUBJECT,
  QUESTION_CODE,
  QUESTION_COLLECTION,
  QUESTION_COMPLEXITY,
  QUESTION_COMPREHENSION,
  QUESTION_IMAGEURLS,
  QUESTION_LESSONSUID,
  QUESTION_ONLYASSESSMENT,
  QUESTION_OPTIONS,
  QUESTION_STATUS,
  QUESTION_SUBTYPE,
  QUESTION_TEXT,
  QUESTION_TYPE,
  QUESTION_UID
} from '@/firebase/firebaseConstants';
import { db, storage } from '@/firebase/firebaseconfig';
import { RequestaddorUpdateQuestion } from '@/firebase/masterAPIS';
import autosize from 'autosize';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import $ from 'jquery';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ulid } from 'ulid';
import { SUPPORTEDMIMETYPES } from '../../constants/acceptedFileMIMETypes';
import * as utility from '../../libraries/utility';
var formatFileNames = [];
var formatFiles = [];
var newoption = {
  uid: "",
  text: "",
  imageurl: "",
  iscorrect: false
}
const OQAQuestion = ({ questionUID }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [complexitychoices, setcomplexitychoices] = useState(null);
  const [questiontypechoices, setquestiontypechoices] = useState(null);
  const [questionDetails, setquestionDetails] = useState(null);
  const [alloptions, setalloptions] = useState([]);
  const [allLessons, setallLessons] = useState([]);
  const [lessonchoices, setlessonchoices] = useState(null);

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
    if (questionUID !== null && questionUID !== undefined) {

      fetchQuestiondetails(questionUID);
    }
  }, [questionUID]);



  async function fetchQuestiondetails(uid) {
    utility.showloading();
    const docRef = doc(db, QUESTION_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    utility.hideloading();
    if (docSnap.exists()) {
      setquestionDetails(docSnap.data());

    } else {

      setquestionDetails(null);
    }
  }


  useEffect(() => {
    if (allLessons.length == 0) {
      return
    }
    var lessons = []
    allLessons.map((lesson) => {
      lessons.push({
        value: lesson.lessonuid,
        customProperties: lesson,
        label: lesson.name,
        selccted: (questionDetails?.[QUESTION_LESSONSUID] || []).includes(lesson.lessonuid)
      })
    })

    lessonchoices.clearChoices().setChoices(lessons)

  }, [allLessons])


  useEffect(() => {


    if (questionDetails != null) {
      $("#filesselecteddiv").empty()
      $("#previouslyselecteddiv").empty()
      $("#questioncode").val(questionDetails[QUESTION_CODE])
      $("#question").val(questionDetails[QUESTION_TEXT])
      $("#comprehension").val(questionDetails[QUESTION_COMPREHENSION])
      complexitychoices.setChoiceByValue(questionDetails[QUESTION_COMPLEXITY])
      questiontypechoices.setChoiceByValue(questionDetails[QUESTION_SUBTYPE])
      setalloptions(questionDetails[QUESTION_OPTIONS])
      lessonchoices.setChoiceByValue(questionDetails[QUESTION_LESSONSUID])
      $('#onlyassessmentswitch').prop('checked', questionDetails[QUESTION_ONLYASSESSMENT]).trigger('change');


      if (questionDetails?.[QUESTION_IMAGEURLS] > 0) {

        utility.showitem('addedimagesdiv')
      } else {

        utility.hideitem('addedimagesdiv')
      }

      questionDetails?.[QUESTION_IMAGEURLS].map((imgurl, index) => {

        var item = `
      
      <div class="w-auto image-input image-input-outline w-auto h-125px m-0"
              id='kt_image_input_control'>
               <a data-fslightbox href="${imgurl}">
              <img 
              style:"max-width:350px !important;"
              src="${imgurl}" class="image-input-wrapper w-auto h-125px"></img>
             </a>
              <span id="${index}_previousremove" class="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-30px h-30px bg-body shadow"
                data-kt-image-input-action="remove"
                data-bs-toggle="tooltip"
                data-bs-dismiss="click"
                style="position: absolute;
    left: calc(100% - 30px);
    top: 30px;"
                title="Remove">
                <i class="ri-delete-bin-6-fill fs-6 my-auto"></i>
              </span>

            </div>`

        $("#previouslyselecteddiv").append(item)
        $(`#${index}_previousremove`).on('click', function (e) {
          e.preventDefault();
          var newQuestionDetails = JSON.parse(JSON.stringify(questionDetails))
          var newQuestionImgURL = newQuestionDetails?.[QUESTION_IMAGEURLS].splice(Number(this.id.replaceAll("_previousremove", "")), 1)


          setquestionDetails(() => {
            return newQuestionDetails
          })
        });
      })

      refreshFsLightbox();
    }

  }, [questionDetails])

  async function getAllLessons() {
    var allLessons = [];
    utility.showloading();
    try {
      const lessonReF = collection(db, LESSON_COLLECTION);

      const q = query(lessonReF,
        orderBy(LESSON_NAME));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allLessons.push({
          lessonuid: doc.id,
          subjectuid: doc.data()[LESSON_SUBJECT].uid,
          courseuid: doc.data()[LESSON_SUBJECT].uid,
          name: doc.data()[LESSON_NAME] + " | " + doc.data()[LESSON_SUBJECT].name + " | " + doc.data()[LESSON_COURSE].name,
        });
      });
    } catch (error) {

      errorCallback(error);
    }
    setallLessons(allLessons);
    utility.hideloading()
  }


  function clearAll() {
    $('.form-control').val('');
    $('#fileselect')[0].value = null;
    formatFileNames = [];
    formatFiles = [];
    $('#accesstypeswitch').prop('checked', false).trigger('change');

  }


  function browseMultipleFiles() {

    var imageselectbutton = document.querySelector('#selectimages');
    imageselectbutton.addEventListener('click', function (e) {
      // e.preventDefault();
      let files = []
      let input = document.createElement('input');
      input.type = 'file';
      input.multiple = true
      input.accept = '.png, .jpg, .jpeg';
      input.onchange = _ => {
        // you can use this method to get file and perform respective operations
        files = Array.from(input.files);

        if (files.length > 10) {
          var message = 'Please Select Max 10 File.';
          utility.showtippy('selectimages', message, 'danger');
          showsnackbar('error', message);
          return;
        }

        files.map((file, index) => {
          var message = ""
          if (!formatFileNames.includes(file.name)) {
            var fileSize = file.size; // in bytes
            if (fileSize > 1e7) {
              message = 'Please Select Max 10MB File, ' + file.name;
              utility.showtippy('fileselect', message, 'danger');
              showsnackbar('error', message);
              return false;
            } else {

              var oFReader = new FileReader();
              oFReader.readAsDataURL(file);
              oFReader.onload = function (oFREvent) {
                formatFileNames.push(file.name);
                formatFiles.push({
                  fileextenstion: file.name.split('.').pop().toLowerCase(),
                  mime: SUPPORTEDMIMETYPES[file.name.split('.').pop().toLowerCase()],
                  filename: file.name,
                  file: file,
                  imagesrc: oFREvent.target.result
                });
                if (index === files.length - 1) {

                  refereshFileDiv()

                }
              };
            }
          }


        });

      };
      input.click();



    });

  }

  function refereshFileDiv() {
    $("#filesselecteddiv").empty()
    formatFiles.map((file, index) => {

      var item = `
      
      <div class="w-auto image-input image-input-outline w-auto h-125px m-0"
              id='kt_image_input_control'>
               <a data-fslightbox href="${file.imagesrc}">
              <img 
              style:"max-width:350px !important;"
              src="${file.imagesrc}" class="image-input-wrapper w-auto h-125px"></img>
             </a>
              <span id="${index}_remove" class="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-30px h-30px bg-body shadow"
                data-kt-image-input-action="remove"
                data-bs-toggle="tooltip"
                data-bs-dismiss="click"
                style="position: absolute;
    left: calc(100% - 30px);
    top: 30px;"
                title="Remove">
                <i class="ri-delete-bin-6-fill fs-6 my-auto"></i>
              </span>

            </div>`

      $("#filesselecteddiv").append(item)
      $(`#${index}_remove`).on('click', function (e) {
        e.preventDefault();
        removeFileFromList(Number(this.id.replaceAll("_remove", "")));
      });
    })

    refreshFsLightbox();
  }

  function removeFileFromList(index) {
    formatFileNames.splice(index, 1)
    formatFiles.splice(index, 1)


    refereshFileDiv()
  }

  useEffect(() => {

    var complexityArray = [
      { value: "", label: "Select Complexity", placeholder: true, disabled: true, selected: true },
      { value: "LOW", label: "Low" },
      { value: "MEDIUM", label: "Medium" },
      { value: "HIGH", label: "High" },
    ]
    var questiontypeArray = [
      { value: "", label: "Select Type", placeholder: true, disabled: true, selected: true },
      { value: "SHORT", label: "Short" },
      { value: "LONG", label: "Long" },
    ]

    setquestiontypechoices(
      new Choices($("#questiontypeselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: true,
        resetScrollPosition: false,
        placeholderValue: "",
        classNames: {
          containerInner: "choices__inner rounded form-control-solid border-0 text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
        },
        choices: questiontypeArray,
      })
    );
    setcomplexitychoices(
      new Choices($("#complexityselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: true,
        resetScrollPosition: false,
        placeholderValue: "",
        classNames: {
          containerInner: "choices__inner rounded form-control-solid border-0 text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
        },
        choices: complexityArray,
      })
    );
    setlessonchoices(
      new Choices($("#lessonsselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: true,
        resetScrollPosition: false,
        placeholderValue: "",
        classNames: {
          containerInner: "choices__inner choices__inner_flexheight form-control-solid border-0 rounded h-auto text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm my-2",
        },
        choices: [],
      })
    );

    browseMultipleFiles()
    autosize($('.autosizetextarea'));
    getAllLessons()
    $('#onlyassessmentswitch').change(function () {
      if (this.checked) {
        $('#onlyassessment_text').text('Question Only In Assessment Mode');
      } else {
        $('#onlyassessment_text').text('Question In Practice and Assessment Mode.');
      }
    });

  }, []);

  async function saveQuestion() {
    $('.is-invalid').removeClass('is-invalid');
    var message = '';
    var previousImages = (questionDetails?.[QUESTION_IMAGEURLS] || [])
    if (utility.isInputEmpty('questioncode')) {
      $('#questioncode').addClass('is-invalid');
      message = 'Please Add Question Code.';
      utility.showtippy('questioncode', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (complexitychoices.getValue(true).length == 0) {
      message = 'Please Select Complexity';
      complexitychoices.showDropdown()
      showsnackbar('error', message);
      return false;
    }
    else if (questiontypechoices.getValue(true).length == 0) {
      message = 'Please Select Type';
      questiontypechoices.showDropdown()
      showsnackbar('error', message);
      return false;
    }
    else if (lessonchoices.getValue(true).length == 0) {
      message = 'Please Select At Least 01 Lesson.';
      lessonchoices.showDropdown()
      showsnackbar('error', message);
      return false;
    }
    else if ((formatFiles.length == 0 && previousImages) && utility.isInputEmpty('question')) {
      message = 'Please add Question Text or Images';
      showsnackbar('error', message);
      return false;
    }




    var questionuid = ulid();
    var questionImageURLS = []


    if (questionDetails !== null) {
      questionuid = questionDetails[QUESTION_UID]
      questionImageURLS = [...questionDetails[QUESTION_IMAGEURLS]]
    }



    utility.info_alert((questionDetails !== null ? 'Update?' : 'Add') + ' Question?', 'Are you sure you want to continue?', 'CONTINUE', 'CANCEL', (() => {

      uploadQuestionImages()

    }), null);

    var uploadQuestionImages = async function () {

      if (formatFiles.length > 0) {
        var counter = 0
        for (let imageFile of formatFiles) {
          utility.showloading()
          var uploadRef = ref(
            storage,
            'Question/' + questionuid + '/QuestionImages/' + counter + ".png")

          var imageBS64 = imageFile.imagesrc.replace("data:image/png;base64,", "").replace("data:image/jpeg;base64,", "").replace("data:image/jpg;base64,", "")
          uploadString(uploadRef, imageBS64, 'base64', { contentType: 'image/png' })
            .then(async (snapshot) => {
              getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                questionImageURLS.push(downloadURL);
                counter++

                if (counter == formatFiles.length) {
                  uploadQuestion()
                }

              });
            })
            .catch((error) => {
              utility.hideloading();
              var message = 'Failed To Upload Image, ' + error.message
              showsnackbar('error', message);
            });
        }
      } else {
        uploadQuestion()
      }




    };



    var uploadQuestion = async () => {
      var log = {
        message: 'Question ' + (questionDetails !== null ? 'Updated' : 'Added'),
        name: utility.get_keyvalue(USER_FULLNAME),
        uid: utility.get_keyvalue(USER_ID),
        date: utility.getDateandTime(),
        timestamp: utility.getTimestamp(),
      }

      var questionData = {
        [QUESTION_UID]: questionuid,
        [QUESTION_CODE]: utility.getinputValue('questioncode'),
        [QUESTION_LESSONSUID]: lessonchoices.getValue(true),
        [QUESTION_TEXT]: utility.getinputValue('question'),
        [QUESTION_TYPE]: "OQA",
        [QUESTION_ONLYASSESSMENT]: $('#onlyassessmentswitch').is(':checked'),
        [QUESTION_COMPLEXITY]: complexitychoices.getValue(true),
        [QUESTION_SUBTYPE]: questiontypechoices.getValue(true),
        [QUESTION_COMPREHENSION]: utility.getinputValue('comprehension'),
        [QUESTION_STATUS]: true,
        [QUESTION_IMAGEURLS]: questionImageURLS,
        [QUESTION_OPTIONS]: [],
      };
      utility.showloading();

      var addorUpdateQuestion = await RequestaddorUpdateQuestion(questionData, log);
      utility.hideloading();
      if (addorUpdateQuestion.status) {
        utility.success_alert(
          'Question ' + (questionDetails !== null ? 'Updated' : 'Added'),
          'Details Added successfully.',
          'OKAY',
          utility.reloadPage,
          null
        );
      } else {
        var message = 'Failed To Add Question, ' + addorUpdateQuestion.message;
        showsnackbar('error', message);
      }
    }


  }


  return (
    <>
      <div className="card p-2 h-100">
        <div className="card-body d-flex flex-column p-4 scroll-y">

          <span className="fs-4 fw-bold">Question Details</span>
          <hr />
          <br />
          <div className="row">
            <div className="fv-row mb-7 col-md-2">
              <label className="required fs-6 fw-semibold mb-2">
                Question Code
              </label>

              <input
                id="questioncode"
                type="text"
                className="form-control form-control-solid fw-bold text-dark"
                placeholder=""
              />
            </div>
            <div className="fv-row mb-7 col-md-2">
              <label className="fs-6 fw-semibold mb-2">
                <span className="required">Complexity</span>

              </label>

              <select id="complexityselect" className="text-sm rounded form-control form-control-solid form-control-sm"></select>
            </div>
            <div className="fv-row mb-7 col-md-2">
              <label className="fs-6 fw-semibold mb-2">
                <span className="required">Question Type</span>

              </label>

              <select id="questiontypeselect" className="text-sm rounded form-control form-control-solid form-control-sm"></select>
            </div>

            <div className="col-md-12 mb-7">
              <div className="d-flex flex-row align-item-center justify-content-between mb-3">
                <label className="required fs-6 fw-semibold mb-2">
                  Include Only In Assessments
                </label>
              </div>
              <div className="d-flex flex-row bg-light border p-2 rounded">
                <label className="form-check form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                  <input
                    className="form-check-input ms-3"
                    name="onlyassessment"
                    type="checkbox"
                    value="1"
                    id="onlyassessmentswitch"
                  />
                </label>

                <div className="me-5 border-start border-1 border-secondary ps-4">
                  <label
                    htmlFor="onlyassessmentswitch"
                    className="fs-6 fw-semibold mb-0"
                  >
                    Include Only In Assessments?
                    <br />
                    <span
                      id="onlyassessment_text"
                      className="fs-7 fw-semibold text-muted mb-0"
                    >
                      Subject In-Active
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="fv-row mb-7 col-md-12">
              <label className="fs-6 fw-semibold mb-2">
                <span className="required">Question Lessons</span>
                <i
                  className="ri-information-line ms-1 fs-7"
                  data-bs-toggle="tooltip"
                  title="Question For Lessons"
                ></i>
              </label>

              <select id="lessonsselect" multiple className="text-sm rounded  form-control form-control-solid"></select>
            </div>
            <div className="fv-row mb-0 col-md-12">
              <label className="required fs-6 fw-semibold mb-2">
                Question
              </label>

              <textarea
                id="question"
                type="text"
                className="form-control form-control-solid fw-bold text-dark autosizetextarea" data-kt-autosize="true"
                placeholder=""
              />
            </div>
            <div className="fv-row mb-7 col-md-12">
              <label className=" fs-6 fw-semibold mb-2">
                Comprehension Text
              </label>

              <textarea
                id="comprehension"
                type="text"
                className="form-control form-control-solid fw-bold text-dark autosizetextarea" data-kt-autosize="true"
                placeholder=""
              />
            </div>
            <div id="addedimagesdiv" className="d-none fv-row mb-7 col-md-12">
              <div className="d-flex flex-row align-item-center justify-content-between mb-3">
                <label className=" fs-6 fw-semibold mb-2">
                  Added Question Images
                </label>

              </div>

              <div id="previouslyselecteddiv" className='d-flex flex-wrap gap-2 border rounded p-2'>

              </div>
            </div>
            <div className="fv-row mb-7 col-md-12">
              <div className="d-flex flex-row align-item-center justify-content-between mb-3">
                <label className=" fs-6 fw-semibold mb-2">
                  Question Images
                </label>
                <button
                  id="selectimages"
                  className="btn btn-sm py-2 btn-light-primary"
                >
                  <span>SELECT IMAGES</span>
                </button>
              </div>

              <div id="filesselecteddiv" className='d-flex flex-wrap gap-2 border rounded p-2'>

              </div>
            </div>
          </div>
        </div>
        <div className="card-footer py-2 px-4">
          <div
            className="d-flex justify-content-end"
          >


            <button
              type="submit"
              id="modal_addsubject_submit"
              onClick={(e) => saveQuestion()}
              className="btn py-2 btn-primary"
            >
              <span>Save Question</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OQAQuestion;
