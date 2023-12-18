import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import FTBQuestion from '../../components/questions/edit-FTB-question';
import MCQQuestion from '../../components/questions/edit-MCQ-question';
import MTFQuestion from '../../components/questions/edit-MTF-question';
import OQAQuestion from '../../components/questions/edit-OQA-question';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import * as utility from '../../libraries/utility';
const EditQuestions = () => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [questionDetails, setquestionDetails] = useState(null);
  const [questionUID, setQuestionUID] = useState(null);
  const [questiontype, setQuestionType] = useState(null);
  const [alloptions, setalloptions] = useState([]);

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
    let uid = router.query?.question;
    let questype = router.query?.view;
    console.log({ uid, questype });
    setQuestionType(() => {
      return questype
    })
    setQuestionUID(() => {
      return uid
    });
    utility.hideloading()
  }, []);



  return (
    <div>

      <div className="d-flex flex-column flex-root app-root mh-100" style={{ height: '100vh' }} id="kt_app_root">
        <div
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={'Edit Question'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-2 mh-100 scroll"
              id="kt_app_main"
            >
              {(() => {
                switch (questiontype) {
                  case fbc.QUESTIONTYPE.MCQ:
                    return (
                      <>
                        <MCQQuestion questionUID={questionUID} />
                      </>
                    );
                  case fbc.QUESTIONTYPE.FTB:
                    return (
                      <>
                        <FTBQuestion questionUID={questionUID} />
                      </>
                    );
                  case fbc.QUESTIONTYPE.MTF:
                    return (
                      <>
                        <MTFQuestion questionUID={questionUID} />
                      </>
                    );
                  case fbc.QUESTIONTYPE.OQA:
                    return (
                      <>
                        <OQAQuestion questionUID={questionUID} />
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


    </div>
  );
};

export default EditQuestions;
export async function getStaticProps() {
  return {
    props: { module: 'COURSEMASTER', onlyAdminAccess: false },
  };
}
