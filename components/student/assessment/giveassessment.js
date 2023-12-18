import * as fbc from '@/firebase/firebaseConstants';
import { db } from '@/firebase/firebaseconfig';
import * as utility from '@/libraries/utility';
import { doc, setDoc } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
const GiveAssessment = ({ stdasmtDetails, setSTDAsmtDetails }) => {
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
    function startTimer(duration) {
        var timer = duration, minutes, seconds;
        setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            $("#duration").text(minutes + ":" + seconds)
            if (--timer < 0) {
                timer = duration;
            }
            if (timer < 0) {
                submitAssessment(true)
            }
        }, 1000);
    }
    useEffect(() => {
        if (stdasmtDetails !== null && stdasmtDetails !== undefined) {
            console.log(stdasmtDetails);

            var activeAttempt = stdasmtDetails[fbc.STDASMT_ACTIVEATTEMPTUID]
            var attempt = stdasmtDetails[fbc.STDASMT_ATTEMPTS][activeAttempt]
            var starttimestamp = attempt.starttimestamp
            var probableEndtimestamp = starttimestamp + Number(stdasmtDetails[fbc.STDASMT_DURATION]) * 60
            var currentTimestmap = moment().unix()
            var timeremaining = probableEndtimestamp - currentTimestmap
            console.log(timeremaining, starttimestamp, probableEndtimestamp);

            if (timeremaining > 0) {
                Object.keys(stdasmtDetails[fbc.STDASMT_ATTEMPTS][activeAttempt].questions).map((key, index) => {
                    addQuestions(stdasmtDetails[fbc.STDASMT_ATTEMPTS][activeAttempt].questions[key], index + 1);

                })
            }
            refreshFsLightbox();
            startTimer(timeremaining)

        }
    }, [stdasmtDetails]);


    function addQuestions(question, index) {

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

            var optionImage = ``

            if (option.imageurl.length > 0) {
                optionImage = `<div>
                                  <a id="a-img-${option.uid}" data-fslightbox href="${option.imageurl}">
                                    <img id="img-${option.uid}" class="mw-200px img-fluid mh-150px w-auto border border-primary" src="${option.imageurl}"></img></a>
                                </div>`
            }

            questionOptions += `
      
      <label id="option-${option.uid}-${question.uid}" class="d-flex flex-row align-items-center mb-5 cursor-pointer border rounded py-3 px-6">
                              <span class="form-check form-check-custom form-check-solid">
                                <input id="${option.uid}-${question.uid}" class="form-check-input" type="radio" name="${question.uid}" value="${option.uid}" />
                              </span>
                              <span class="d-flex flex-column ms-6 border-end border-1 border-dark pe-6">
                                <span class="fw-bold fs-6">${index + 1}.</span>
                              </span>
                              <span class="d-flex flex-column align-items-start gap-4 ms-6">

                                
                                ${optionImage}


                                <span class="d-flex flex-column">
                                  <span class="fw-bold fs-6">${option.text}</span>
                                </span>

                              </span>
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

        $(`input[type=radio][name=${question.uid}]`).change(function () {
            var questionuid = this.id.split("-")[1]
            var selectedValue = this.value
            console.log(questionuid);
            $(`#pills-question-${questionuid}-btn`).removeClass('btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary')
            $(`#pills-question-${questionuid}-btn`).addClass('btn-bg-success text-white')
            submitQuestionAnswer(questionuid, selectedValue)
        });
    }

    async function submitQuestionAnswer(questionuid, selectedAnswer) {
        var activeAttempt = stdasmtDetails[fbc.STDASMT_ACTIVEATTEMPTUID]
        await setDoc(doc(db, fbc.STDASMT_COLLECTION, stdasmtDetails[fbc.STDASMT_UID]), {
            stdasmt_attempts: {
                [activeAttempt]: {
                    questions: {
                        [questionuid]: {
                            answerselected: [selectedAnswer]
                        }
                    },
                    answeredquestions: {
                        [questionuid]: {
                            answerselected: [selectedAnswer]
                        }
                    }
                }
            }
        }, { merge: true });


        if (stdasmtDetails[fbc.STDASMT_ISPRACTICE]) {
            var question = stdasmtDetails[fbc.STDASMT_ATTEMPTS][activeAttempt].questions[questionuid]
            var iscorrectAnswer = false;
            var correntAnswerUIDs = []
            question.options.map(option => {
                if (option.iscorrect) {
                    correntAnswerUIDs.push(option.uid)
                }
                if (option.uid === selectedAnswer && option.iscorrect) {
                    iscorrectAnswer = true;
                }
            })
            correntAnswerUIDs.map(uid => {
                $(`#option-${uid}-${questionuid}`).addClass("bg-light-success")
            })

            if (!iscorrectAnswer) {
                $(`#option-${selectedAnswer}-${questionuid}`).addClass("bg-light-danger")
            }
            console.log({ iscorrectAnswer, correntAnswerUIDs });
        }


    }

    async function submitAssessment(isforceSubmit = false) {

        if (isforceSubmit) {
            submit()
        } else {
            utility.info_alert("Submit " + (stdasmtDetails[fbc.STDASMT_TITLE]) + ' Assessment?', 'Are you sure you want to continue?', 'SUBMIT', 'CANCEL', (async () => {
                submit()
            }), null);
        }

        async function submit() {
            utility.showloading()
            var activeAttempt = stdasmtDetails[fbc.STDASMT_ACTIVEATTEMPTUID]
            await setDoc(doc(db, fbc.STDASMT_COLLECTION, stdasmtDetails[fbc.STDASMT_UID]), {
                stdasmt_attempts: {
                    [activeAttempt]: {
                        enddate: utility.getDate(),
                        endtime: utility.getTime("HH:mm:ss"),
                        endtimestamp: utility.getTimestamp(),
                        status: fbc.STDASMT_STATUSTYPE.COMPLETED,
                    }
                },
                [fbc.STDASMT_STATUS]: fbc.STDASMT_STATUSTYPE.COMPLETED,
            }, { merge: true });
            // await utility.delay(350)
            // await setDoc(doc(db, fbc.STDASMT_COLLECTION, stdasmtDetails[fbc.STDASMT_UID]), {
            //     [fbc.STDASMT_STATUS]: fbc.STDASMT_STATUSTYPE.COMPLETED,
            // }, { merge: true });
            await utility.delay(2000)
            utility.hideloading()
            utility.reloadPage()
        }
    }

    return (
        <>
            {stdasmtDetails != null ? <>

                <div className="card w-md-75 w-100 mx-auto mt-5">
                    <div className="card-header bg-light-success py-4 px-2">
                        <div className="card-title d-flex flex-row justify-content-between align-items-center w-100 mb-0 m-0">
                            <div className="d-flex flex-row align-items-center w-100  justify-content-between gap-4">

                                <div className="d-flex flex-column ps-4">

                                    <div className="d-flex flex-row">
                                        {stdasmtDetails[fbc.STDASMT_ISPRACTICE] ? <span className="badge badge-success px-3 py-4 fs-7 mb-3 badge-square badge-sm">PRACTICE</span> : <></>}
                                    </div>
                                    <span className="fs-2 mb-2 fw-bolder">{stdasmtDetails[fbc.STDASMT_TITLE]}</span>
                                    <span className="fs-4 text-muted">{stdasmtDetails[fbc.STDASMT_CODE]}
                                    </span>
                                </div>

                                <div className="d-flex flex-row">
                                    <div className="d-flex flex-row px-4 mx-auto gap-2">

                                        <div className="d-flex flex-column pe-4">
                                            <span id="duration" className="fs-1 mb-1 fw-bolder text-danger text-center"></span>
                                            <span className="fs-5 text-dark fw-semibold  text-center">Time Left</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="card-body p-4 d-flex flex-md-row flex-column gap-2">
                        <div className="d-flex flex-column col-md-9 p-5 border rounded">

                            <div className="tab-content w-100 my-2 p-1" id="items-pills-tabContent">


                            </div>



                        </div>
                        <div className="d-flex flex-column col-md-3 p-5 border rounded">

                            <div className="d-flex flex-column my-2">
                                <button
                                    onClick={(e) => {
                                        submitAssessment()
                                    }}
                                    className="btn btn-block w-100 btn-primary fs-6 hover-elevate-up">Submit Assessment</button>
                            </div>
                            <hr className="text-muted" />
                            <span className="fs-5 text-muted fw-semibold mb-4  text-start">Questions</span>
                            <ul className="nav nav-pills d-flex flex-wrap gap-2 justify-content-start" id="questionbtn-pills-tab" role="tablist">

                            </ul>
                        </div>
                    </div>

                </div>
            </> : <></>}
        </>
    );
};

export default GiveAssessment;
