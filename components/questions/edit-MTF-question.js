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
const MTFQuestion = ({ questionUID }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [addoptionModal, setaddoptionModal] = useState(null);
  const [complexitychoices, setcomplexitychoices] = useState(null);
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
      console.log(docSnap.id);
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

  function clearOption() {
    $('#answertext').val('');

    document.getElementById("selectoptionimage").src = "https://placehold.co/200"
    utility.hideitem('deleteimagebutton')
    $('#correctanswerswitch').prop('checked', false).trigger('change');
    newoption = {
      uid: "",
      text: "",
      imageurl: "",
      iscorrect: false
    }

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
    initModal()
    autosize($('.autosizetextarea'));
    getAllLessons()
  }, []);
  function imageHandler() {
    var quilitem = this.quill
    var range = this.quill.getSelection();
    var imgvalue = null
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
        imgvalue = oFREvent.target.result

        quilitem.insertEmbed(range.index, 'image', imgvalue, Quill.sources.USER);

      };
    };
    input.click();


  }
  function initModal() {
    var element;
    var cancelButton;
    var closeButton;
    var modal;
    $('#correctanswerswitch').change(function () {
      if (this.checked) {
        $('#correctanswer_text').text('CORRECT ANSWER');
      } else {
        $('#correctanswer_text').text('INCORRECT ANSWER');
      }
    });
    $('#onlyassessmentswitch').change(function () {
      if (this.checked) {
        $('#onlyassessment_text').text('Question Only In Assessment Mode');
      } else {
        $('#onlyassessment_text').text('Question In Practice and Assessment Mode.');
      }
    });
    element = document.querySelector('#modal_addoption');
    modal = new bootstrap.Modal(element);
    setaddoptionModal(modal);
    cancelButton = document.querySelector('#modal_addoption_cancel');
    closeButton = document.querySelector('#modal_addoption_close');
    var deleteimagebutton = document.querySelector('#deleteimagebutton');
    var changeimageButton = document.querySelector('#changeimagebutton');
    changeimageButton.addEventListener('click', function (e) {
      // e.preventDefault();
      let files = []
      let input = document.createElement('input');
      input.type = 'file';
      input.accept = '.png, .jpg, .jpeg';
      input.onchange = _ => {
        // you can use this method to get file and perform respective operations
        files = Array.from(input.files);
        var oFReader = new FileReader();
        var file = files[0]


        oFReader.readAsDataURL(files[0]);

        oFReader.onload = function (oFREvent) {
          document.getElementById("selectoptionimage").src = oFREvent.target.result;

          newoption["isnew"] = true
          newoption["imageurl"] = oFREvent.target.result
          utility.showitem('deleteimagebutton', 'd-flex')

        };
      };
      input.click();



    });

    deleteimagebutton.addEventListener('click', function (e) {
      e.preventDefault();
      newoption["imageurl"] = ""
      document.getElementById("selectoptionimage").src = "https://placehold.co/200"
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


  function addOption() {
    $('.is-invalid').removeClass('is-invalid');
    var message=""
    if (newoption.imageurl === "" && utility.isInputEmpty('answertext')) {
      message = 'Please Add Image Or Enter Text.';
      showsnackbar('error', message);
      return false;
    }
    var optiondetails = JSON.parse(JSON.stringify(newoption))

    var optionuid = optiondetails["uid"].length === 0 ? utility.randomstring() + "_" + utility.getTimestamp() : optiondetails["uid"]
    var index = -1
    if (optiondetails["uid"].length > 0) {
      optionuid = optiondetails["uid"]
      alloptions.map((option, i) => {
        if (option.uid === optionuid) {
          index = i
        }
      })

      document.getElementById(`img-${optionuid}`).src = optiondetails.imageurl;
      $(`#a-img-${optionuid}`).attr("href", optiondetails.imageurl)
    }

    if (optiondetails["isnew"] === undefined) {

      optiondetails["isnew"] = optiondetails["uid"].length === 0
    }
    optiondetails["uid"] = optionuid
    optiondetails["text"] = utility.getinputValue('answertext')
    optiondetails["iscorrect"] = $('#correctanswerswitch').is(':checked')


    setalloptions(alloptions => {

      if (index > -1) {

        var updatedOptions = [...alloptions]
        updatedOptions[index] = optiondetails
        return updatedOptions
      } else {

        return [...alloptions, optiondetails]
      }

    })
    $("#modal_addoption_close").click()

    refreshFsLightbox();
  }

  useEffect(() => {
    $("#optionsdiv").empty()


    alloptions.map(optiondetails => {
      var optionuid = optiondetails.uid
      var optionelement = `<div id="option_${optionuid}" class="bg-light d-flex flex-column flex-md-row gap-2 align-items-center border rounded mb-3 p-2">

           
            <div class="d-flex flex-column gap-2">
             ${optiondetails.iscorrect ? `
           
             <div> <span class="badge badge-success fs-7 p-2 w-auto">CORRECT ANSWER</span></div>
            
            `: ``}

            <div class="d-flex flex-column flex-md-row gap-2">
            
            
            
            ${optiondetails.imageurl !== "" ? `
            <a id="a-img-${optionuid}" data-fslightbox href="${optiondetails.imageurl}">
            <img id="img-${optionuid}" class="rounded p-2 mw-200px img-fluid mh-150px w-auto border border-primary" src="${optiondetails.imageurl}"></img></a>` : ""}
            
            
            
            ${optiondetails["text"].length > 0 ? `
            <span class="fs-6 fw-bold p-2 mw-100 mw-md-450px my-2">
            ${optiondetails["text"]}
            </span>`: ``}
            
            </div>
           </div>
           
            <div class='d-flex flex-column  me-2 ms-auto gap-2'>
              <button
                id="editoption_${optionuid}"
                class="btn btn-sm py-2 btn-primary"
              >
                <span>EDIT</span>
              </button>
              <button
                id="deleteoption_${optionuid}"
                data-bs-toggle="tooltip"
                title="Option Will Be Removed For The Question."
                class="btn btn-sm py-2 btn-danger"
              >
                <span>DELETE</span>
              </button>
            </div>
          </div>
`
      $("#optionsdiv").append(optionelement)

      $('#editoption_' + optionuid).on('click', function () {
        var clickedOption = this.id.replaceAll("editoption_", "")

        alloptions.map((option, i) => {
          if (option.uid === clickedOption) {
            newoption = (option)
            document.getElementById("selectoptionimage").src = option.imageurl;
            $('#answertext').val(option.text);
            $('#correctanswerswitch').prop('checked', option.iscorrect).trigger('change');
            utility.showitem('deleteimagebutton', 'd-flex')
            addoptionModal.show()
          }
        })
      });
      $('#deleteoption_' + optionuid).on('click', function () {
        deleteOption(this.id.replaceAll("deleteoption_", ""));
      });
    })
    refreshFsLightbox();
  }, [alloptions])

  function deleteOption(optionuid) {
    var optionIndex = -1
    alloptions.map((option, i) => {
      if (option.uid === optionuid) {
        optionIndex = i
      }
    })

    if (optionIndex > -1) {
      utility.info_alert('Delete Selected Option!', 'Are you sure you want to continue?', 'CONTINUE', 'CANCEL', (() => {

        var updatedOptions = []
        alloptions.map((option, i) => {
          if (option.uid !== optionuid) {
            updatedOptions.push(option)
          }
        })
        $("#option_" + optionuid).remove()
        setalloptions(() => {
          return updatedOptions
        })

      }), null);

    } else {
     var message = 'Option Not Found';
      showsnackbar('error', message);
    }

  }

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
    } else if (alloptions.length === 0) {
      message = 'Please add Options';
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
                  uploadOptions()
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
        uploadOptions()
      }




    };


    var finalOptions = []
    var uploadOptions = async function () {
      async function upload(counter) {
        var option = alloptions[counter]
        utility.showloading()
        if (option.isnew !== undefined && option.isnew) {
          var uploadRef = ref(
            storage,
            'Question/' + questionuid + '/QuestionOptionImages/' + counter + ".png")

          var imageBS64 = option.imageurl.replace("data:image/png;base64,", "").replace("data:image/jpeg;base64,", "").replace("data:image/jpg;base64,", "")
          await uploadString(uploadRef, imageBS64, 'base64', { contentType: 'image/png' })
            .then(async (snapshot) => {
              await getDownloadURL(snapshot.ref).then((downloadURL) => {
                option.imageurl = downloadURL
                delete option.isnew
                counter++
                finalOptions.push(JSON.parse(JSON.stringify(option)))
                if (counter == alloptions.length) {
                  uploadSubject()
                } else {
                  upload(counter)
                }
              });
            })
            .catch((error) => {
              utility.hideloading();
              var message = 'Failed To Upload Image, ' + error.message
              showsnackbar('error', message);
            });
        } else {
          counter++
          delete option.isnew
          finalOptions.push(JSON.parse(JSON.stringify(option)))
          if (counter == alloptions.length) {
            uploadSubject()
          } else {
            upload(counter)
          }
        }
      }
      upload(0)
    };



    var uploadSubject = async () => {
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
        [QUESTION_TYPE]: "MTF",
        [QUESTION_ONLYASSESSMENT]: $('#onlyassessmentswitch').is(':checked'),
        [QUESTION_COMPLEXITY]: complexitychoices.getValue(true),
        [QUESTION_SUBTYPE]: "",
        [QUESTION_COMPREHENSION]: utility.getinputValue('comprehension'),
        [QUESTION_STATUS]: true,
        [QUESTION_IMAGEURLS]: questionImageURLS,
        [QUESTION_OPTIONS]: finalOptions,
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

          <br />
          <div className="d-flex flex-row align-items-center justify-content-between">

            <span className="fs-4 fw-bold">Answer Options</span>
            <button
              onClick={(e) => {
                clearOption()
                addoptionModal.show()
              }}
              id="addoption"
              className="btn btn-sm py-2 btn-success"
            >
              <span>ADD OPTION</span>
            </button>
          </div>
          <hr />
          <br />
          <div id='optionsdiv' className="d-flex flex-column border rounded p-2">




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
      <div
        data-backdrop="static" data-keyboard="false"
        className="modal fade"
        id="modal_addoption"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-xl">
          <div className="modal-content">
            <div className="modal-header p-5" id="modal_addoption_header">
              <h4 className="fw-bold">Add / Modify Option</h4>

              <button
                onClick={(e) => clearOption()}
                id="modal_addoption_close"
                className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
              >
                <span className="ri-close-line fs-1"></span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-12">
                  <label className="required fs-6 fw-semibold mb-2">
                    Answer Text
                  </label>

                  <textarea
                    id="answertext"
                    type="text"
                    className="form-control form-control-solid fw-bold text-dark autosizetextarea" data-kt-autosize="true"
                    placeholder=""
                  />
                </div>
                <div className="col-md-3">
                  <div className="d-flex flex-row align-item-center justify-content-between mb-3">
                    <label className="required fs-6 fw-semibold mb-2">
                      Option Image (Max 01 Image)
                    </label>
                  </div>

                  <div className="w-auto image-input image-input-outline  w-auto h-125px">

                    <img id="selectoptionimage" src='https://placehold.co/200'
                      className="image-input-wrapper w-auto mw-200px h-125px"></img>
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
                <div className="col-md-4">
                  <div className="d-flex flex-row align-item-center justify-content-between mb-3">
                    <label className="required fs-6 fw-semibold mb-2">
                      Answer Type
                    </label>
                  </div>
                  <div className="d-flex flex-row  border p-2 rounded">
                    <label className="form-check form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                      <input
                        className="form-check-input ms-3"
                        name="correctanswer"
                        type="checkbox"
                        value="1"
                        id="correctanswerswitch"
                      />
                    </label>

                    <div className="me-5 border-start border-1 border-secondary ps-4">
                      <label
                        htmlFor="correctanswerswitch"
                        className="fs-6 fw-semibold mb-0"
                      >
                        Is Correct Answer?
                        <br />
                        <span
                          id="correctanswer_text"
                          className="fs-7 fw-semibold text-muted mb-0"
                        >
                          Subject In-Active
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
                onClick={(e) => clearOption()}
                id="modal_addoption_cancel"
                className="btn py-2 btn-light me-3"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="modal_addoption_submit"
                onClick={(e) => addOption()}
                className="btn py-2 btn-primary"
              >
                <span>ADD OPTION</span>
              </button>
            </div>
          </div>
        </div>
      </div ></>
  );
};

export default MTFQuestion;
