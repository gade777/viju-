import * as utility from '@/libraries/utility';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import * as fbc from '../../firebase/firebaseConstants';
const QuestionShowAnswers = ({ stdasmtDetails, setQuestionModal }) => {
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
    initModal();
  }, []);
  useEffect(() => {
    if (stdasmtDetails !== null && stdasmtDetails !== undefined) {
      console.log(stdasmtDetails);
      var lastAttempt = stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]
      Object.keys(stdasmtDetails[fbc.STDASMT_ATTEMPTS][lastAttempt].questions).map((key, index) => {
        addQuestions(stdasmtDetails[fbc.STDASMT_ATTEMPTS][lastAttempt].questions[key], index + 1);

      })
    }
  }, [stdasmtDetails]);
  function addQuestions(question, index) {
    // console.log(question);
    var correctAnswerUIDs = []
    var questionBtn = ` <button
                          id="pills-question-${question.uid}-btn"
                          data-bs-toggle="pill"
                          data-bs-target="#pills-question-${question.uid}"
                          type="button"
                          role="tab"
                          aria-controls="pills-question-${question.uid}"
                          aria-selected="true"
                          class="nav-link p-3 btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary">${utility.padwithzero(index)}</button>
`

    $("#questionbtn-pills-tab").append(questionBtn)

    var questionImages = ``

    question.imageurls.map((imageurl, index) => {
      questionImages += ` <div>
                              <a id="a-img-${index}-${question.uid}" data-fslightbox href="${imageurl}">
                                <img id="img-${index}-${question.uid}" class="p-0 img-fluid w-auto mw-500px border border-primary" src="${imageurl}"></img></a>
                            </div>`
    })
    var questionOptions = ``

    question.options.map((option, index) => {

      if (option.iscorrect) {
        correctAnswerUIDs.push(option.uid)
      }
      var optionImage = ``

      if (option.imageurl.length > 0) {
        optionImage = `<div>
                                  <a id="a-img-${option.uid}" data-fslightbox href="${option.imageurl}">
                                    <img id="img-${option.uid}" class="mw-200px img-fluid mh-150px w-auto border border-primary" src="${option.imageurl}"></img></a>
                                </div>`
      }

      var correctAnswer = `<span class="badge p-3 fs-7 badge-light-success">
                            CORRECT
                          </span>`;
      var answerGiven = `<span class="badge p-3 fs-7 badge-light-primary">
                            ANSWERED
                          </span>`;

      questionOptions += `
      
      <label id="option-${option.uid}-${question.uid}" class="d-flex flex-row align-items-center mb-5 cursor-pointer border rounded py-3 px-6">
                           
                              <span class="d-flex flex-column border-end border-1 border-dark pe-6">
                                <span class="fw-bold fs-6">${index + 1}.</span>
                              </span>
                              <span class="d-flex flex-column align-items-start gap-4 ms-6">

                                
                                ${optionImage}


                                <span class="d-flex flex-column">
                                  <span class="fw-bold fs-6">${option.text}</span>
                                </span>

                              </span>
                              <div class="d-flex flex-column gap-2 me-0 ms-auto align-items-center">
                                  ${question.answerselected.includes(option.uid) ? answerGiven : ""}
                                  ${correctAnswerUIDs.includes(option.uid) ? correctAnswer : ""}
                              </div>
                            </label>
      `
    })
    var questionItem = `
                        <div class="tab-pane fade w-100 h-100 "
                          id="pills-question-${question.uid}"
                          role="tabpanel"
                          aria-labelledby="pills-question-${question.uid}-tab">

                          <div class="d-flex flex-column ">
                            <span id="questiontext_${question.uid}" 
                            class="fs-4 fw-bolder text-start text-wrap">${question.text}</span>
                            <span id="comprehensiontext${question.uid}" 
                            class="fs-6 my-2 text-start">${question.comprehension}</span>
                            

                            ${question.imageurls.length > 0 ? ` <div id="questionimagesdiv${question.uid}" class='d-flex flex-wrap gap-2 my-3'>
                            ${questionImages}
                            </div>`: ``}
                           
                            <hr class="text-muted" />

                            
                            <div class="d-flex flex-column gap-3">
                            ${questionOptions}
                            </div>
                          </div>
                          
                        </div>
`
    $("#items-pills-tabContent").append(questionItem)

    if (index === 1) {
      $(`#pills-question-${question.uid}-btn`).click()
    }

    if (question.answerselected.length > 0) {
      $("input[name=" + question.uid + "][value=" + question.answerselected[0] + "]").attr('checked', 'checked');
    }

  }

  function initModal() {
    var element;
    var cancelButton;
    var closeButton;
    var modal;

    element = document.querySelector('#modal_questions');
    modal = new bootstrap.Modal(element);
    setQuestionModal(modal);
    cancelButton = document.querySelector('#modal_questions_cancel');
    closeButton = document.querySelector('#modal_questions_close');

    closeButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });
    cancelButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });
  }


  return (
    <div
      className="modal fade"
      id="modal_questions"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable modal-xl h-100">
        <div className="modal-content">
          <div className="modal-header p-5" id="modal_questions_header">
            <h4 className="fw-bold">{stdasmtDetails?.[fbc.STDASMT_TITLE] || ""}</h4>
            <button
              id="modal_questions_close"
              className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
            >
              <span className="ri-close-line fs-1"></span>
            </button>
          </div>

          <div className="modal-body p-4">
            <div className="d-flex flex-md-row flex-column gap-2">
              <div className="d-flex flex-column col-md-9 p-5 border rounded">

                <div className="tab-content w-100 my-2 p-1" id="items-pills-tabContent">


                </div>



              </div>
              <div className="d-flex flex-column col-md-3 p-5 border rounded">

                <span className="fs-5 text-muted fw-semibold mb-4  text-start">Questions</span>
                <ul className="nav nav-pills d-flex flex-wrap gap-2 justify-content-start" id="questionbtn-pills-tab" role="tablist">

                </ul>
              </div>
            </div>
          </div>

          <div className="modal-footer flex-end p-3">
            <button
              type="reset"
              id="modal_questions_cancel"
              className="btn py-2 btn-light me-3"
            >
              Close
            </button>


          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionShowAnswers;
