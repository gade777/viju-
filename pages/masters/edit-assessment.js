import { USER_FULLNAME, USER_ID } from '@/constants/appconstants';
import { RequestaddorUpdateAssessment } from '@/firebase/masterAPIS';
import { arrayUnion, collection, deleteField, doc, getDoc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ulid } from 'ulid';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import { ASMT_CODE, ASMT_COLLECTION, ASMT_COURSE, ASMT_DURATION, ASMT_GENERALINSTRUCTIONS, ASMT_HASNEGATIVEMARKING, ASMT_ISLIVE, ASMT_ISPRACTICE, ASMT_LESSON, ASMT_LOGS, ASMT_QUESTIONS, ASMT_STATUS, ASMT_SUBJECT, ASMT_TITLE, ASMT_TOTAL, ASMT_UID, LESSON_CODE, LESSON_COLLECTION, LESSON_COURSE, LESSON_NAME, LESSON_SUBJECT, LESSON_UID, QUESTION_CODE, QUESTION_COLLECTION, QUESTION_COMPLEXITY, QUESTION_LESSONSUID, QUESTION_ONLYASSESSMENT, QUESTION_SUBTYPE, QUESTION_TEXT, QUESTION_TYPE, QUESTION_UID } from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';
const EditAssessment = () => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [asmtUID, setAssessmentUID] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [asmtDetails, setAsmtDetails] = useState(null);
  const [lessonuid, setLessonUID] = useState(null);
  const [addquestionModal, setaddquestionModal] = useState(null);
  const [questionchoices, setquestionchoices] = useState(null);
  const [allQuestionsForLesson, setallQuestionsForLesson] = useState([]);
  const [addedQuestions, setaddedQuestions] = useState({});

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
    let lessonuid = router.query?.lesson || null;
    let assessmentuid = router.query?.id || null;
    console.log({ lessonuid, assessmentuid });

    setAssessmentUID(() => {
      return assessmentuid
    });
    setLessonUID(() => {
      return lessonuid
    });
    utility.hideloading()
    initModal()

    $('#practiceassessmentswitch').change(function () {
      if (this.checked) {
        $('#practiceassessment_text').text('Practice Assessment, Duration Will Be Ignored');
      } else {
        $('#practiceassessment_text').text('Regular Assessment.');
      }
    });
    $('#negativemarkingswitch').change(function () {
      if (this.checked) {
        $('#negativemarking_text').text('Negative Marking Enabled');
      } else {
        $('#negativemarking_text').text('Negative Marking Disabled');
      }
    });
    $('#assessmentliveswitch').change(function () {
      if (this.checked) {
        $('#assessmentlive_text').text('Is Live.');
      } else {
        $('#assessmentlive_text').text('Is Not Live.');
      }
    });

    setquestionchoices(
      new Choices($("#questionselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: true,
        resetScrollPosition: false,
        placeholderValue: "",
        classNames: {
          containerInner: "choices__inner rounded form-control-solid border-0 text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
        },
        choices: [],
      })
    );

  }, []);
  useEffect(() => {
    if (lessonuid !== null && lessonuid !== undefined) {
      getAllQuestionForLessons(lessonuid);
    }
  }, [lessonuid]);


  useEffect(() => {
    if (asmtUID !== null && asmtUID !== undefined) {
      getAsmtDetails(asmtUID);
    }
  }, [asmtUID]);

  useEffect(() => {
    if (asmtDetails !== null && asmtDetails !== undefined) {
      $("#asmtcode").val(asmtDetails[ASMT_CODE])
      $("#asmttitle").val(asmtDetails[ASMT_TITLE])
      $("#generalinstructions").val(asmtDetails[ASMT_GENERALINSTRUCTIONS])
      $("#asmtduration").val(asmtDetails[ASMT_DURATION])
      $('#negativemarkingswitch').prop('checked', asmtDetails[ASMT_HASNEGATIVEMARKING]).trigger('change');
      $('#assessmentliveswitch').prop('checked', asmtDetails[ASMT_ISLIVE]).trigger('change');
      $('#practiceassessmentswitch').prop('checked', asmtDetails[ASMT_ISPRACTICE]).trigger('change');

      setaddedQuestions(asmtDetails[ASMT_QUESTIONS])
    }
  }, [asmtDetails]);

  useEffect(() => {
    if (questionchoices !== null && questionchoices !== undefined) {
      var array = [
        { value: "", label: "Select Question", placeholder: true, disabled: true, selected: true },
      ]
      allQuestionsForLesson.map(question => {
        array.push(
          {
            value: question[QUESTION_UID],
            label: question[QUESTION_TYPE] + " | " + question[QUESTION_COMPLEXITY] + " | " + question[QUESTION_TEXT],
            customProperties: question,
          },)
      })
      questionchoices.setChoices(array)
    }
  }, [allQuestionsForLesson]);

  async function getAsmtDetails(asmtuid) {


    const docRef = doc(db, ASMT_COLLECTION, asmtuid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setAsmtDetails(docSnap.data())
    } else {
      errorCallback({ message: "Invalid Lesson, Failed To Continue." });
      return
    }
    utility.hideloading()
  }
  async function getAllQuestionForLessons(lessonuid) {


    const docRef = doc(db, LESSON_COLLECTION, lessonuid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setLesson(docSnap.data())
    } else {
      errorCallback({ message: "Invalid Lesson, Failed To Continue." });
      return
    }

    var allQuestionsForLesson = [];
    utility.showloading();
    try {
      const questionReF = collection(db, QUESTION_COLLECTION);
      const q = query(questionReF,
        where(QUESTION_LESSONSUID, 'array-contains', lessonuid),
        orderBy(QUESTION_CODE));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allQuestionsForLesson.push(doc.data());
      });
    } catch (error) {
      console.log(error);
      errorCallback(error);
    }
    setallQuestionsForLesson(allQuestionsForLesson);
    utility.hideloading()
  }



  function addQuestion() {
    $('.is-invalid').removeClass('is-invalid');
    var message = '';
    if (questionchoices.getValue(true).length == 0) {
      message = 'Please Select Question';
      questionchoices.showDropdown()
      showsnackbar('error', message);
      return false;
    } else if (questionchoices.getValue().customProperties[QUESTION_ONLYASSESSMENT] && $('#practiceassessmentswitch').is(':checked')) {
      message = 'Question Only Available For Assessments Not For Practice Assesments.';
      questionchoices.showDropdown()
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('questionmarks')) {
      $('#questionmarks').addClass('is-invalid');
      message = 'Please Add Question Marks.';
      utility.showtippy('questionmarks', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.getinputValueInNumbers('questionmarks') < 0) {
      $('#questionmarks').addClass('is-invalid');
      message = 'Please Add Valid Question Marks.';
      utility.showtippy('questionmarks', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('negativemarks') && $('#negativemarkingswitch').is(':checked')) {
      $('#negativemarks').addClass('is-invalid');
      message = 'Please Add Negative Marks.';
      utility.showtippy('negativemarks', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.getinputValueInNumbers('negativemarks') < 0 && $('#negativemarkingswitch').is(':checked')) {
      $('#negativemarks').addClass('is-invalid');
      message = 'Please Add Valid Negative Marks.';
      utility.showtippy('negativemarks', message, 'danger');
      showsnackbar('error', message);
      return false;
    }

    var questionData = questionchoices.getValue().customProperties
    var question = {
      uid: questionData[QUESTION_UID],
      type: questionData[QUESTION_TYPE],
      subtype: questionData[QUESTION_SUBTYPE],
      text: questionData[QUESTION_TEXT],
      complexity: questionData[QUESTION_COMPLEXITY],
      onlyassessment: questionData[QUESTION_ONLYASSESSMENT],
      code: questionData[QUESTION_CODE],
      marks: utility.getinputValueInNumbers('questionmarks'),
      negativemarks: utility.getinputValueInNumbers('negativemarks') || 0,
    }

    setaddedQuestions(questions => {
      var updatesQuestion = JSON.parse(JSON.stringify(questions));
      updatesQuestion[questionData[QUESTION_UID]] = question
      return updatesQuestion
    })
    clearQuestion()
    addquestionModal.hide()
  }
  useEffect(() => {

    var totalmarks = 0
    Object.keys(addedQuestions).map(key => {
      totalmarks += addedQuestions[key].marks
    })
    $("#totalmarks").val(totalmarks)

    $('#practiceassessmentswitch').attr('disabled', (Object.keys(addedQuestions).length > 0));
    $('#negativemarkingswitch').attr('disabled', (Object.keys(addedQuestions).length > 0));

  }, [addedQuestions]);

  function deleteQuestion(questionID) {

    if (asmtUID !== null) {
      var log = {
        message: 'Question Deleted From Assessment, ' + questionID,
        name: utility.get_keyvalue(USER_FULLNAME),
        uid: utility.get_keyvalue(USER_ID),
        date: utility.getDateandTime(),
        timestamp: utility.getTimestamp(),
      }
      const docRef = doc(db, ASMT_COLLECTION, asmtUID);


      utility.info_alert('Delete Question?', 'Are you sure you want to continue?', 'CONTINUE', 'CANCEL', (async () => {

        await setDoc(docRef, {
          [ASMT_QUESTIONS + "." + questionID]: deleteField(),
          [ASMT_LOGS]: arrayUnion(log)
        }, { merge: true })

        setaddedQuestions(questions => {
          var updatesQuestion = JSON.parse(JSON.stringify(questions));
          delete updatesQuestion[questionID]
          return updatesQuestion
        })
      }), null);



    } else {
      setaddedQuestions(questions => {
        var updatesQuestion = JSON.parse(JSON.stringify(questions));
        delete updatesQuestion[questionID]
        return updatesQuestion
      })
    }



  }

  function clearQuestion() {
    questionchoices.removeActiveItems()
    $("#negativemarks").val("")
    $("#questionmarks").val("")
  }

  function initModal() {
    var element;
    var cancelButton;
    var closeButton;
    var modal;

    element = document.querySelector('#modal_addquestion');
    modal = new bootstrap.Modal(element);
    setaddquestionModal(modal);
    cancelButton = document.querySelector('#modal_addquestion_cancel');
    closeButton = document.querySelector('#modal_addquestion_close');

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

    if (utility.isInputEmpty('asmtcode')) {
      $('#asmtcode').addClass('is-invalid');
      message = 'Please Add Assessment Code.';
      utility.showtippy('asmtcode', message, 'danger');
      showsnackbar('error', message);
      return false;
    }
    else if (utility.isInputEmpty('asmttitle')) {
      $('#asmttitle').addClass('is-invalid');
      message = 'Please Add Assessment Title.';
      utility.showtippy('asmttitle', message, 'danger');
      showsnackbar('error', message);
      return false;
    }

    else if (utility.isInputEmpty('asmtduration')) {
      $('#asmtduration').addClass('is-invalid');
      message = 'Please Add Assessment Duration.';
      utility.showtippy('asmtduration', message, 'danger');
      showsnackbar('error', message);
      return false;
    }
    else if (utility.getinputValueInNumbers('asmtduration') <= 0) {
      $('#asmtduration').addClass('is-invalid');
      message = 'Please Add Valid Assessment Duration.';
      utility.showtippy('asmtduration', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (utility.isInputEmpty('generalinstructions')) {
      $('#generalinstructions').addClass('is-invalid');
      message = 'Please Add Assessment General Instructions.';
      utility.showtippy('generalinstructions', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (Object.keys(addedQuestions).length > 0) {
      var message = ""
      for (let index = 0; index < (Object.keys(addedQuestions).length || 0); index++) {
        var question = addedQuestions[Object.keys(addedQuestions)[index]];
        if (question.onlyassessment && $('#practiceassessmentswitch').is(':checked')) {
          message = 'Question Only Available For Assessments Not For Practice Assesments, For ' + question.code;
          questionchoices.showDropdown()
          showsnackbar('error', message);
          return;
        } else if (question.negativemarks === 0 && $('#negativemarkingswitch').is(':checked')) {
          message = 'Please Add Valid Negative Marks, For ' + question.code;
          questionchoices.showDropdown()
          showsnackbar('error', message);
          return;
        } else {
          return true;
        }
      }
    }
    else {
      return true;
    }
    // else if (Object.keys(addedQuestions).length == 0) {
    //   message = 'Please Add Questions.'
    //   showsnackbar('error', message);
    //   return false;
    // }


  }
  async function saveAssessment() {
    if (checkifDataisCorrect()) {

      var asmtuid = ulid();

      if (asmtUID !== null) {
        asmtuid = asmtUID
      }

      utility.info_alert((asmtUID !== null ? 'Update?' : 'Add') + ' Assessment?', 'Are you sure you want to continue?', 'CONTINUE', 'CANCEL', (() => {

        uploadData()

      }), null);


      var uploadData = async function () {
        var log = {
          message: 'Assessment ' + (asmtUID !== null ? 'Updated' : 'Added'),
          name: utility.get_keyvalue(USER_FULLNAME),
          uid: utility.get_keyvalue(USER_ID),
          date: utility.getDateandTime(),
          timestamp: utility.getTimestamp(),
        }
        var totalmarks = 0
        Object.keys(addedQuestions).map(key => {
          totalmarks += addedQuestions[key].marks
        })

        var data = {
          [ASMT_UID]: asmtuid,
          [ASMT_LESSON]: {
            name: lesson[LESSON_NAME],
            code: lesson[LESSON_CODE],
            uid: lesson[LESSON_UID],
          },
          [ASMT_STATUS]: true,
          [ASMT_SUBJECT]: lesson[LESSON_SUBJECT],
          [ASMT_COURSE]: lesson[LESSON_COURSE],
          [ASMT_CODE]: utility.getinputValue('asmtcode'),
          [ASMT_TITLE]: utility.getinputValue('asmttitle'),
          [ASMT_GENERALINSTRUCTIONS]: utility.getinputValue('generalinstructions'),
          [ASMT_DURATION]: utility.getinputValueInNumbers('asmtduration'),
          [ASMT_ISPRACTICE]: $('#practiceassessmentswitch').is(':checked'),
          [ASMT_TOTAL]: totalmarks,
          [ASMT_HASNEGATIVEMARKING]: $('#negativemarkingswitch').is(':checked'),
          [ASMT_ISLIVE]: $('#assessmentliveswitch').is(':checked'),
          [ASMT_QUESTIONS]: addedQuestions,
        }

        utility.showloading();

        var addorUpdateAssessment = await RequestaddorUpdateAssessment(data, log);
        utility.hideloading();
        if (addorUpdateAssessment.status) {
          utility.success_alert(
            'Assessment ' + (asmtUID !== null ? 'Updated' : 'Added'),
            'Details Added successfully.',
            'OKAY',
            window.close,
            null
          );
        } else {
          var message = 'Failed To Add Assessment, ' + addorUpdateAssessment.message;
          showsnackbar('error', message);
        }
      }
    }
  }


  async function deleteAssessment() {
    utility.info_alert('Delete Assessment?', 'Are you sure you want to continue?', 'CONTINUE', 'CANCEL', (() => {

      uploadData()

    }), null);

    var uploadData = async function () {
      var log = {
        message: 'Assessment Deleted',
        name: utility.get_keyvalue(USER_FULLNAME),
        uid: utility.get_keyvalue(USER_ID),
        date: utility.getDateandTime(),
        timestamp: utility.getTimestamp(),
      }
      var data = {
        [ASMT_STATUS]: false,
      }


      utility.showloading();

      var addorUpdateAssessment = await RequestaddorUpdateAssessment(data, log);
      utility.hideloading();
      if (addorUpdateAssessment.status) {
        utility.success_alert(
          'Assessment Deleted!',
          'Details Added successfully.',
          'OKAY',
          window.close,
          null
        );
      } else {
        var message = 'Failed To Add Assessment, ' + addorUpdateAssessment.message;
        showsnackbar('error', message);
      }
    }

  }


  return (
    <div>

      <div className="d-flex flex-column flex-root app-root mh-100" style={{ height: '100vh' }} id="kt_app_root">
        <div
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={'Edit Assessment'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-2 mh-100 scroll"
              id="kt_app_main"
            >
              <div className="card p-2 h-100">
                <div className="card-body d-flex flex-column p-4 scroll-y">

                  <span className="fs-4 fw-bold">Assessment Details</span>
                  <hr />
                  <br />
                  <div className="row">

                    <div className="fv-row mb-7 col-md-2">
                      <label className="required fs-6 fw-semibold mb-2">
                        Code
                      </label>

                      <input
                        id="asmtcode"
                        type="text"
                        className="form-control form-control-solid fw-bold text-dark"
                        placeholder=""
                      />
                    </div>
                    <div className="fv-row mb-7 col-md-6">
                      <label className="fs-6 fw-semibold mb-2">
                        <span className="required">Title</span>

                      </label>

                      <input
                        id="asmttitle"
                        type="text"
                        className="form-control form-control-solid fw-bold text-dark"
                        placeholder=""
                      />
                    </div>
                    <div className="fv-row mb-7 col-md-2">
                      <label className="required fs-6 fw-semibold mb-2">
                        Duration (in Minutes)
                      </label>

                      <input
                        id="asmtduration"
                        type="number"
                        className="form-control form-control-solid fw-bold text-dark"
                        placeholder=""
                      />
                    </div>
                    <div className="fv-row mb-7 col-md-2">
                      <label className="required fs-6 fw-semibold mb-2">
                        Exam Total Marks
                        <i
                          className="ri-information-line ms-1 fs-7"
                          data-bs-toggle="tooltip"
                          title="Add Questions, Marks Will Be Added"
                        ></i>
                      </label>

                      <input
                        disabled
                        id="totalmarks"
                        type="number"
                        data-bs-toggle="tooltip"
                        title="Add Questions"
                        defaultValue={0}
                        className="form-control form-control-solid fw-bold text-dark"
                        placeholder=""
                      />
                    </div>
                    <div className="col-md-4 mb-7">
                      <div className="d-flex flex-row align-item-center justify-content-between mb-3">
                        <label className="required fs-6 fw-semibold mb-2">
                          Practice Assessment
                        </label>
                      </div>
                      <div className="d-flex flex-row bg-light border p-2 rounded">
                        <label className="form-check form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                          <input
                            className="form-check-input ms-3"
                            name="practiceassessment"
                            type="checkbox"
                            value="1"
                            id="practiceassessmentswitch"
                          />
                        </label>

                        <div className="me-5 border-start border-1 border-secondary ps-4">
                          <label
                            htmlFor="practiceassessmentswitch"
                            className="fs-6 fw-semibold mb-0"
                          >
                            Is Practice Assessment?
                            <br />
                            <span
                              id="practiceassessment_text"
                              className="fs-7 fw-semibold text-muted mb-0"
                            >
                              Regular Assessment.
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-7">
                      <div className="d-flex flex-row align-item-center justify-content-between mb-3">
                        <label className="required fs-6 fw-semibold mb-2">
                          Negative Marking
                        </label>
                      </div>
                      <div className="d-flex flex-row bg-light border p-2 rounded">
                        <label className="form-check form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                          <input
                            className="form-check-input ms-3"
                            name="negativemarking"
                            type="checkbox"
                            value="1"
                            id="negativemarkingswitch"
                          />
                        </label>

                        <div className="me-5 border-start border-1 border-secondary ps-4">
                          <label
                            htmlFor="negativemarkingswitch"
                            className="fs-6 fw-semibold mb-0"
                          >
                            Has Negative Marking?
                            <br />
                            <span
                              id="negativemarking_text"
                              className="fs-7 fw-semibold text-muted mb-0"
                            >
                              Regular Assessment.
                            </span>
                          </label>
                        </div>

                      </div>

                    </div>

                    <div className="col-md-4 mb-7">
                      <div className="d-flex flex-row align-item-center justify-content-between mb-3">
                        <label className=" fs-6 fw-semibold mb-2">
                          Assesment Live
                        </label>
                      </div>

                      <div className="d-flex flex-row bg-light border p-2 rounded">
                        <label className="form-check form-switch  form-switch-sm form-check-custom form-check-solid  form-check-success me-5">
                          <input
                            className="form-check-input ms-3"
                            name="assessmentlive"
                            type="checkbox"
                            value="1"
                            id="assessmentliveswitch"
                          />
                        </label>

                        <div className="me-5 border-start border-1 border-secondary ps-4">
                          <label
                            htmlFor="assessmentliveswitch"
                            className="fs-6 fw-semibold mb-0"
                          >
                            Assesment Is Live?
                            <br />
                            <span
                              id="assessmentlive_text"
                              className="fs-7 fw-semibold text-muted mb-0"
                            >
                              Is Live.
                            </span>
                          </label>
                        </div>

                      </div>
                    </div>
                  </div>
                  <div className="fv-row mb-0 col-md-12">
                    <label className="required fs-6 fw-semibold mb-2">
                      General Instructions
                    </label>

                    <textarea
                      id="generalinstructions"
                      type="text"
                      className="form-control form-control-solid fw-bold text-dark autosizetextarea" data-kt-autosize="true"
                      placeholder=""
                    />
                  </div>
                  <br />
                  <div className="d-flex flex-row align-items-center justify-content-between">

                    <span className="fs-4 fw-bold">Questions</span>
                    <button
                      onClick={(e) => {
                        addquestionModal.show()
                      }}
                      id="addquestion"
                      className="btn btn-sm py-2 btn-success"
                    >
                      <span>ADD QUESTION</span>
                    </button>
                  </div>
                  <hr />
                  <br />
                  <div id='questiondiv' className="d-flex flex-column border rounded p-2">
                    <table
                      className="table align-middle table-row-dashed fs-6"
                      id="questiontable"
                    >
                      <thead>
                        <tr className="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                          <th className="py-0 px-3 min-w-40px">#</th>
                          <th className="py-0 px-3 min-w-70px">Type</th>
                          <th className="py-0 px-3 min-w-70px">Complexity</th>
                          <th className="py-0 px-3 min-w-200px">Question</th>
                          <th className="py-0 px-3 min-w-70px">Marks</th>
                          <th className="py-0 px-3 min-w-70px">Neg. Marks</th>
                          <th className="py-0 px-3 min-w-50px">Action</th>
                        </tr>
                      </thead>

                      <tbody id="questiontablebody" className="fw-semibold text-gray-600">
                        {Object.keys(addedQuestions).map((key, index) => {
                          return (
                            <tr id={addedQuestions[key].uid + '_row'} key={index}>
                              <td className="text-dark py-2 px-2 fs-6 fw-bolder align-middle col-1">
                                {index + 1}.
                              </td>
                              <td className="text-dark py-2 px-2 fs-6 fw-bolder align-middle col-1">
                                {addedQuestions[key].type}
                              </td>
                              <td className="text-dark py-2 px-2 fs-6 fw-bolder align-middle col-1">
                                {addedQuestions[key].complexity}
                              </td>
                              <td className="text-dark py-2 px-2 fs-6 fw-bolder align-middle col">
                                {addedQuestions[key].text}
                              </td>
                              <td className="text-dark py-2 px-2 fs-6 fw-bolder align-middle col-1">
                                {addedQuestions[key].marks}
                              </td>
                              <td className="text-dark py-2 px-2 fs-6 fw-bolder align-middle col-1">
                                {addedQuestions[key].negativemarks}
                              </td>
                              <td className="text-dark py-2 px-2 fs-6 fw-bolder align-middle col-1">
                                <a
                                  onClick={(e) => {
                                    console.log(e);
                                    deleteQuestion(e.target.id.replaceAll("_delete", ""))
                                  }}
                                  id={addedQuestions[key].uid + '_delete'}
                                  className="btn btn-sm btn-icon btn-light-danger"
                                >
                                  <i className="ri-delete-bin-6-fill fs-6"></i>
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                  </div>




                </div>
                <div className="card-footer py-2 px-4">
                  <div
                    className="d-flex justify-content-end gap-2"
                  >

                    {asmtUID != null ? <>
                      <button
                        onClick={(e) => deleteAssessment()}
                        className="btn py-2 btn-danger"
                      >
                        <span>Delete Assessment</span>
                      </button>
                    </> : <> </>}

                    <button
                      type="submit"
                      id="modal_addsubject_submit"
                      onClick={(e) => saveAssessment()}
                      className="btn py-2 btn-primary"
                    >
                      <span>Save Assessment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        data-backdrop="static" data-keyboard="false"
        className="modal fade"
        id="modal_addquestion"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-xl">
          <div className="modal-content h-100">
            <div className="modal-header p-5" id="modal_addquestion_header">
              <h4 className="fw-bold">Add Question</h4>

              <button
                onClick={(e) => clearQuestion()}
                id="modal_addquestion_close"
                className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
              >
                <span className="ri-close-line fs-1"></span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="fv-row mb-7 col-md-12">
                  <label className="fs-6 fw-semibold mb-2">
                    <span className="required">Select Question</span>

                  </label>
                  <select id="questionselect" className="text-sm rounded form-control form-control-solid form-control-sm"></select>
                </div>
                <div className="fv-row mb-7 col-md-4">
                  <label className="required fs-6 fw-semibold mb-2">
                    Marks
                  </label>

                  <input
                    id="questionmarks"
                    type="number"
                    className="form-control form-control-solid fw-bold text-dark"
                    placeholder=""
                  />
                </div>
                <div className="fv-row mb-7 col-md-4">
                  <label className="required fs-6 fw-semibold mb-2">
                    Negative Marks
                  </label>

                  <input
                    id="negativemarks"
                    type="number"
                    className="form-control form-control-solid fw-bold text-dark"
                    placeholder=""
                  />
                </div>
              </div>

            </div>

            <div className="modal-footer flex-end p-3">
              <button
                type="reset"
                onClick={(e) => clearQuestion()}
                id="modal_addquestion_cancel"
                className="btn py-2 btn-light me-3"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="modal_addquestion_submit"
                onClick={(e) => addQuestion()}
                className="btn py-2 btn-primary"
              >
                <span>ADD QUESTION</span>
              </button>
            </div>
          </div>
        </div>
      </div >

    </div>
  );
};

export default EditAssessment;
export async function getStaticProps() {
  return {
    props: { module: 'COURSEMASTER', onlyAdminAccess: false },
  };
}
