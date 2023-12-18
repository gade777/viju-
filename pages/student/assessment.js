
import { USER_ID } from '@/constants/appconstants';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import AssessmentDetails from '../../components/student/assessment/asmtdetails';
import GiveAssessment from '../../components/student/assessment/giveassessment';
import SubmittedAssesmentDetails from '../../components/student/assessment/submittedAssessment';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';

const Assessment = () => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [asmtUID, setAssessmentUID] = useState(null);
  const [asmtDetails, setAsmtDetails] = useState(null);
  const [stdasmtDetails, setSTDAsmtDetails] = useState(null);
  const [allQuestions, setallQuestions] = useState([]);



  useEffect(() => {
    let assessmentuid = router.query?.id || null;
    setAssessmentUID(() => {
      return assessmentuid
    });
  }, []);

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
    if (asmtUID !== null && asmtUID !== undefined) {
      getAsmtDetails(asmtUID);
    }
  }, [asmtUID]);

  useEffect(() => {
    if (stdasmtDetails !== null && stdasmtDetails !== undefined) {
      var diff = utility.getTimestamp() - (stdasmtDetails[fbc.STDASMT_ATTEMPTS]?.[stdasmtDetails[fbc.STDASMT_LASTATTEMPTUID]].endtimestamp)
      console.log(diff);
      if (diff < 60) {
        setTimeout(() => {
          utility.reloadPage()
        }, 40000);
      }
    }
  }, [stdasmtDetails]);
  async function getAsmtDetails(asmtuid) {

    const studentAsmtdocRef = doc(db, fbc.STDASMT_COLLECTION, asmtuid + "_" + utility.get_keyvalue(USER_ID));
    const studentAsmtdocSnap = await getDoc(studentAsmtdocRef);

    if (studentAsmtdocSnap.exists()) {
      setSTDAsmtDetails(studentAsmtdocSnap.data())
    } else {
      const docRef = doc(db, fbc.ASMT_COLLECTION, asmtuid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAsmtDetails(docSnap.data())
      } else {
        errorCallback({ message: "Invalid Lesson, Failed To Continue." });
        return
      }
    }

    utility.hideloading()
  }


  return (
    <div>

      <div className="d-flex flex-column flex-root app-root mh-100" style={{ height: '100vh' }} id="kt_app_root">
        <div
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={'Assessment'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-2 mh-100 scroll"
              id="kt_app_main"
            >

              {stdasmtDetails === null ? <>
                <AssessmentDetails asmtDetails={asmtDetails} setSTDAsmtDetails={setSTDAsmtDetails} />
              </> : <>

                {(() => {
                  switch (stdasmtDetails?.[fbc.STDASMT_STATUS]) {
                    case fbc.STDASMT_STATUSTYPE.ACTIVE:
                      return (
                        <>
                          <GiveAssessment stdasmtDetails={stdasmtDetails} />
                        </>
                      );
                    case fbc.STDASMT_STATUSTYPE.COMPLETED:
                      return (
                        <>
                          <SubmittedAssesmentDetails stdasmtDetails={stdasmtDetails} />
                        </>
                      );
                    case fbc.STDASMT_STATUSTYPE.CLOSED:
                      return (
                        <>
                          <SubmittedAssesmentDetails stdasmtDetails={stdasmtDetails} />
                        </>
                      );
                    default:
                      return null;
                  }
                })()}


              </>}


            </div>

          </div>
        </div>
      </div>


    </div>
  );
};

export default Assessment;
export async function getStaticProps() {
  return {
    props: { module: 'STUDENTSUBJECTDETAILS', onlyAdminAccess: false },
  };
}
