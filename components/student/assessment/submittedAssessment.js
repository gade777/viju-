import QuestionShowAnswers from '@/components/masters/show-question-answer';
import * as fbc from '@/firebase/firebaseConstants';
import * as utility from '@/libraries/utility';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

const SubmittedAssesmentDetails = ({ stdasmtDetails, setSTDAsmtDetails }) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [questionModal, setQuestionModal] = useState(null);

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


    return (
        <>
            {stdasmtDetails != null ? <>

                <div className="card w-md-550px w-100 mx-auto mt-5">
                    <div className="card-header bg-light-success py-4 px-2">
                        <div className="card-title d-flex flex-row justify-content-between align-items-center w-100 mb-0 m-0">
                            <div className="d-flex flex-row align-items-center w-100  justify-content-between gap-4">

                                <div className="d-flex flex-column ps-4">

                                    <div className="d-flex flex-row">
                                        {stdasmtDetails[fbc.STDASMT_ISPRACTICE] ? <span className="badge badge-success px-3 py-4 fs-7 mb-3 badge-square badge-sm">PRACTICE</span> : <></>}
                                    </div>
                                    <span className="display-6 mb-2 fw-bolder">{stdasmtDetails[fbc.STDASMT_TITLE]}</span>
                                    <span className="fs-4 text-muted">{stdasmtDetails[fbc.STDASMT_CODE]}
                                    </span>
                                </div>

                            </div>
                        </div>

                    </div>

                    <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex flex-row">
                            <div className="d-flex flex-row px-4 mx-auto gap-2">

                                <div className="d-flex flex-column border-end pe-4 mx-4">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{stdasmtDetails[fbc.STDASMT_DURATION]} <span className="fs-6 mb-1 fw-bold text-center">mins</span></span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Duration</span>
                                </div>
                                <div className="d-flex flex-column border-end pe-4 mx-4">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{utility.padwithzero(Object.keys(stdasmtDetails[fbc.STDASMT_ATTEMPTS][stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]].questions).length)}</span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Questions</span>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{utility.padwithzero(stdasmtDetails[fbc.STDASMT_TOTAL])}</span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Marks</span>
                                </div>
                            </div>
                        </div>
                        <hr className='text-muted' />
                        <div className="d-flex flex-row">
                            <div className="d-flex flex-row px-4 mx-auto gap-2">
                                <div className="d-flex flex-column border-end pe-4 mx-4">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{Math.round((stdasmtDetails[fbc.STDASMT_ATTEMPTS]?.[stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]].endtimestamp - stdasmtDetails[fbc.STDASMT_ATTEMPTS]?.[stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]].starttimestamp) / 60)} <span className="fs-6 mb-1 fw-bold text-center">mins</span></span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Time Taken</span>
                                </div>
                                <div className="d-flex flex-column border-end pe-4 mx-4">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{utility.padwithzero(Object.keys(stdasmtDetails[fbc.STDASMT_ATTEMPTS][stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]].answeredquestions).length)}</span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Attempeted</span>
                                </div>
                                <div className="d-flex flex-column border-end pe-4 mx-4">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{utility.padwithzero(stdasmtDetails[fbc.STDASMT_ATTEMPTS][stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]].scored)}</span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Scored</span>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{utility.padwithzero(stdasmtDetails[fbc.STDASMT_ATTEMPTS][stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]].negativemarks)}</span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Neg. Marks</span>
                                </div>
                            </div>
                        </div>

                        <hr className='text-muted' />
                        <div className="d-flex flex-row align-items-center w-100 justify-content-between">
                            <div className="d-flex flex-column w-100 ">


                                {
                                    utility.getTimestamp() - (stdasmtDetails[fbc.STDASMT_ATTEMPTS]?.[stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]].endtimestamp) < 60 ? <><span className=" py-3 px-4 fw-bold fs-7 text-center mx-auto text-warning badge my-2">ASSESSMENT UNDER REVIEW PLEASE WAIT...</span></> : <></>
                                }

                                {(() => {
                                    switch (stdasmtDetails[fbc.STDASMT_ATTEMPTS][stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]].status) {

                                        case fbc.STDASMT_STATUSTYPE.COMPLETED:
                                            return (
                                                <>

                                                    <div className="d-flex flex-column gap-5 m-0">
                                                        <span className="fs-3 w-100 text-center fw-bolder bg-light-success py-3 text-uppercase text-success rounded border border-success">ASSESSMENT COMPLETED</span>

                                                        <button
                                                            onClick={(e) => {
                                                                questionModal.show()
                                                            }}
                                                            className="btn btn-block w-100 btn-light-primary fs-4 hover-elevate-up">VIEW QUESTIONS</button></div>

                                                    <QuestionShowAnswers
                                                        stdasmtDetails={stdasmtDetails}
                                                        setQuestionModal={setQuestionModal}
                                                    />


                                                </>
                                            );
                                        case fbc.STDASMT_STATUSTYPE.CLOSED:
                                            return (
                                                <>
                                                    <span className="fs-3 w-100 text-center fw-bolder bg-light-danger py-3 text-uppercase text-danger rounded border border-danger">ASSESSMENT CLOSED</span>
                                                </>
                                            );

                                        default:
                                            return null;
                                    }
                                })()}

                            </div>

                        </div>

                    </div>

                </div>
            </> : <></>}
        </>
    );
};

export default SubmittedAssesmentDetails;
