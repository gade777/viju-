import { USER_FULLNAME, USER_ID } from '@/constants/appconstants';
import * as fbc from '@/firebase/firebaseConstants';
import { db } from '@/firebase/firebaseconfig';
import { RequestcreateStudentAssessmentAttempt } from '@/firebase/masterAPIS';
import * as utility from '@/libraries/utility';
import { doc, getDoc } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { ulid } from 'ulid';

const AssesmentDetails = ({ asmtDetails, setSTDAsmtDetails }) => {
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

    async function startAssesment() {
        utility.info_alert("Start " + (asmtDetails[fbc.ASMT_TITLE]) + ' Assessment?', 'Are you sure you want to continue?', 'CONTINUE', 'CANCEL', (() => {

            uploadData()

        }), null);
        var uploadData = async function () {

            utility.showloading()
            var attemptUID = ulid()
            var log = {
                message: 'Assessment Started for Attempt : ' + attemptUID,
                name: utility.get_keyvalue(USER_FULLNAME),
                uid: utility.get_keyvalue(USER_ID),
                date: utility.getDateandTime(),
                timestamp: utility.getTimestamp(),
            }

            utility.showloading();

            var addorUpdateAssessment = await RequestcreateStudentAssessmentAttempt({
                attemptuid: attemptUID,
                log,
                stduid: utility.get_keyvalue(USER_ID),
                asmtuid: asmtDetails[fbc.ASMT_UID],
                student: {
                    uid: utility.get_keyvalue(USER_ID),
                    name: utility.get_keyvalue(USER_FULLNAME),
                }
            });
            if (addorUpdateAssessment.status) {
                // await setDoc(doc(db, fbc.STDASMT_COLLECTION, stdasmt_uid), {
                //     stdasmt_attempts: {
                //         [attemptUID]: {
                //             questions: {
                //                 "01H440H8EY4ZR9TKEM1TTWSYC7": { negativemarks: 2 }
                //             }
                //         }
                //     }
                // }, { merge: true });
                const studentAsmtdocRef = doc(db, fbc.STDASMT_COLLECTION, addorUpdateAssessment.data);
                const studentAsmtdocSnap = await getDoc(studentAsmtdocRef);
                setSTDAsmtDetails(studentAsmtdocSnap.data())
                utility.hideloading();

            } else {
                utility.hideloading();
                var message = addorUpdateAssessment.message;
                showsnackbar('error', message);
            }


            // var questions = {}
            // Object.keys(asmtDetails[fbc.ASMT_QUESTIONS]).map(key => {
            //     var question = asmtDetails[fbc.ASMT_QUESTIONS][key]
            //     questions[key] = {
            //         ...question,
            //         options:[],
            //         scored: 0,
            //         answerselected: {}
            //     }

            // })
            // var attempt = {
            //     uid: attemptUID,
            //     startdate: utility.getDate(),
            //     starttime: utility.getTime(),
            //     starttimestamp: utility.getTimestamp(),
            //     enddate: "",
            //     endtime: "",
            //     endtimestamp: 0,
            //     questions,
            //     answeredquestions: {},
            //     total: asmtDetails[fbc.ASMT_TOTAL],
            //     scored: 0,
            //     negativemarks: 0,
            //     hasnegativemarking: asmtDetails[fbc.ASMT_HASNEGATIVEMARKING],
            // }

            // var stdasmt_uid = asmtDetails[fbc.ASMT_UID] + "_" + utility.get_keyvalue(USER_ID)
            // var data = {
            //     [STDASMT_UID]: stdasmt_uid,
            //     [STDASMT_ASMTUID]: asmtDetails[fbc.ASMT_UID],
            //     [STDASMT_LESSON]: asmtDetails[fbc.ASMT_LESSON],
            //     [STDASMT_STATUS]: fbc.STDASMT_STATUSTYPE.ACTIVE,
            //     [STDASMT_SUBJECT]: asmtDetails[fbc.ASMT_SUBJECT],
            //     [STDASMT_COURSE]: asmtDetails[fbc.ASMT_COURSE],
            //     [STDASMT_CODE]: asmtDetails[fbc.ASMT_CODE],
            //     [STDASMT_TITLE]: asmtDetails[fbc.ASMT_TITLE],
            //     [STDASMT_GENERALINSTRUCTIONS]: asmtDetails[fbc.ASMT_GENERALINSTRUCTIONS],
            //     [STDASMT_DURATION]: asmtDetails[fbc.ASMT_DURATION],
            //     [STDASMT_ISPRACTICE]: asmtDetails[fbc.ASMT_ISPRACTICE],
            //     [STDASMT_TOTAL]: asmtDetails[fbc.ASMT_TOTAL],
            //     [STDASMT_HASNEGATIVEMARKING]: asmtDetails[fbc.ASMT_HASNEGATIVEMARKING],
            //     [STDASMT_ACTIVEATTEMPTUID]: attemptUID,
            //     [STDASMT_ATTEMPTS]: { [attemptUID]: attempt },
            //     [STDASMT_LOGS]: arrayUnion(log),
            // }

            // await setDoc(doc(db, fbc.STDASMT_COLLECTION, stdasmt_uid), data, { merge: true });
            // const studentAsmtdocRef = doc(db, fbc.STDASMT_COLLECTION, stdasmt_uid);
            // const studentAsmtdocSnap = await getDoc(studentAsmtdocRef);

            // if (studentAsmtdocSnap.exists()) {

            //     // await setDoc(doc(db, fbc.STDASMT_COLLECTION, stdasmt_uid), {
            //     //     stdasmt_attempts: {
            //     //         [attemptUID]: {
            //     //             questions: {
            //     //                 "01H440H8EY4ZR9TKEM1TTWSYC7": { negativemarks: 2 }
            //     //             }
            //     //         }
            //     //     }
            //     // }, { merge: true });
            //     setSTDAsmtDetails(studentAsmtdocSnap.data())
            // }
            // utility.hideloading()
        }
    }
    return (
        <>
            {asmtDetails != null ? <>

                <div className="card w-md-450px w-100 mx-auto mt-5">
                    <div className="card-header bg-light-success py-4 px-2">
                        <div className="card-title d-flex flex-row justify-content-between align-items-center w-100 mb-0 m-0">
                            <div className="d-flex flex-row align-items-center w-100  justify-content-between gap-4">

                                <div className="d-flex flex-column ps-4">

                                    <div className="d-flex flex-row">
                                        {asmtDetails[fbc.ASMT_ISPRACTICE] ? <span className="badge badge-success px-3 py-4 fs-7 mb-3 badge-square badge-sm">PRACTICE</span> : <></>}
                                    </div>
                                    <span className="display-6 mb-2 fw-bolder">{asmtDetails[fbc.ASMT_TITLE]}</span>
                                    <span className="fs-4 text-muted">{asmtDetails[fbc.ASMT_CODE]}
                                    </span>
                                </div>

                            </div>
                        </div>

                    </div>

                    <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex flex-row">
                            <div className="d-flex flex-row px-4 mx-auto gap-2">

                                <div className="d-flex flex-column border-end pe-4 mx-4">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{asmtDetails[fbc.ASMT_DURATION]} <span className="fs-6 mb-1 fw-bold text-center">mins</span></span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Duration</span>
                                </div>
                                <div className="d-flex flex-column border-end pe-4 mx-4">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{utility.padwithzero(Object.keys(asmtDetails[fbc.ASMT_QUESTIONS]).length)}</span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Questions</span>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fs-3 mb-1 fw-bolder text-center">{utility.padwithzero(asmtDetails[fbc.ASMT_TOTAL])}</span>
                                    <span className="fs-5 text-muted fw-semibold  text-center">Marks</span>
                                </div>
                            </div>
                        </div>
                        <hr className='text-muted' />
                        <div className="d-flex flex-row align-items-center w-100 justify-content-between">
                            <div className="d-flex flex-column ps-4  w-100 ">
                                <span className="fs-4 w-100 text-center fw-bolder">General Instructions</span>
                            </div>

                        </div>
                        <hr className='text-muted' />
                        <div className="d-flex flex-column p-4">

                            <p className="fs-5 text-dark fw-semibold">
                                {asmtDetails[fbc.ASMT_GENERALINSTRUCTIONS]}
                            </p>
                        </div>


                    </div>
                    <div className="card-footer p-3 bg-light ">
                        <div className="d-flex flex-row m-2"><button
                            onClick={(e) => {
                                startAssesment()
                            }}
                            className="btn btn-block w-100 btn-primary fs-4 hover-elevate-up">Start Assessment</button></div>
                    </div>
                </div>
            </> : <></>}
        </>
    );
};

export default AssesmentDetails;
