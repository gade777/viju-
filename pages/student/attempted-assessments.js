import { USER_ID } from '@/constants/appconstants';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';

const AttemptedAssessments = () => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [appearedasmts, setappearedasmts] = useState({});

  useEffect(() => {
    getAttemptedAsmts();
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
    $(`#lessontabContent_live`).empty();
    if (Object.keys(appearedasmts).length === 0) {
      var item = ` <div class="d-flex flex-row bg-white border rounded py-2 px-5 w-100 justify-content-between mb-2 ">

          <div class="d-flex flex-column">
            <span class="fs-5 fw-bold">No Attempted Assessments Available</span>
          </div>
        </div>`;

      $(`#lessontabContent_live`).empty().append(item);
      return;
    }

    Object.keys(appearedasmts).map((uid) => {
      var asmt = appearedasmts[uid];
      var showWarning =
        utility.getTimestamp() -
          asmt[fbc.STDASMT_ATTEMPTS]?.[asmt[fbc.STDASMT_LASTATTEMPTUID]]
            .endtimestamp >
        60;
      var warning = ``;
      var appearedStatus = ``;

      if (asmt[fbc.STDASMT_STATUS] == fbc.STDASMT_STATUSTYPE.ACTIVE) {
        appearedStatus = `<span class="badge py-3 px-4 fw-bold rounded-pill fs-8 badge-danger badge me-3">ACTIVE</span>`;
      }
      if (asmt[fbc.STDASMT_STATUS] == fbc.STDASMT_STATUSTYPE.COMPLETED) {
        appearedStatus = `<span class="badge py-3 px-4 fw-bold rounded-pill fs-8 badge-success badge me-3">COMPLETED</span>`;
      }
      if (asmt[fbc.STDASMT_STATUS] == fbc.STDASMT_STATUSTYPE.CLOSED) {
        appearedStatus = `<span class="badge py-3 px-4 fw-bold rounded-pill fs-8 badge-primary badge me-3">CLOSED</span>`;
      }

      var item = ` <div id="asmtdiv_${
        asmt[fbc.STDASMT_UID]
      }" class="d-flex flex-row bg-light-primary border rounded p-3 justify-content-between mb-2">
      
      <div class="d-flex flex-row align-items-center w-75"> 
      
          <div class="d-flex flex-column">
            <span class="fs-2 fw-bolder text-wrap mb-1">${
              asmt[fbc.STDASMT_TITLE]
            }</span>

            <span class="text-xs fw-semibold  mb-1">${
              asmt[fbc.STDASMT_CODE]
            } | ${asmt[fbc.STDASMT_DURATION]}mins | ${
        asmt[fbc.STDASMT_TOTAL]
      } Marks</span>
             ${showWarning ? warning : ''}
            <span class="text-xs text-dark fw-semibold">Attempts : ${utility.padwithzero(
              Object.keys(asmt[fbc.STDASMT_ATTEMPTS]).length
            )} 
             | Last Attempt Marks : ${
               asmt[fbc.STDASMT_ATTEMPTS]?.[asmt[fbc.STDASMT_LASTATTEMPTUID]]
                 ?.scored || 0
             } | Last Attempt Time Taken : ${Math.round(
        (asmt[fbc.STDASMT_ATTEMPTS]?.[asmt[fbc.STDASMT_LASTATTEMPTUID]]
          .endtimestamp -
          asmt[fbc.STDASMT_ATTEMPTS]?.[asmt[fbc.STDASMT_LASTATTEMPTUID]]
            .starttimestamp) /
          60
      )} mins</span>
          
          </div>
      </div>

          <div class='d-flex flex-row align-items-center gap-2 py-2'>

          ${appearedStatus}
           
            <button
            id="viewasmt_${
              asmt[fbc.STDASMT_UID]
            }" class="btn rounded-pill  h-30px px-4 fs-6 py-1 btn-sm btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary">
              <i class="ri-eye-fill fs-5"></i>
              view
            </button>
            
          </div>

        </div>`;

      $(`#lessontabContent_live`).append(item);

      $(`#viewasmt_${asmt[fbc.STDASMT_UID]}`).on('click', function (e) {
        window.open(
          window.location.origin +
            '/student/assessment?id=' +
            this.id.split('_')[1],
          '_blank'
        );
      });
    });
  }, [appearedasmts]);

  async function getAttemptedAsmts() {
    const appeared_asmtReF = collection(db, fbc.STDASMT_COLLECTION);
    const appeared_q = query(
      appeared_asmtReF,
      where(fbc.STDASMT_STUDENT + '.uid', '==', utility.get_keyvalue(USER_ID))
    );
    var appeared_asmts = {};
    const appeared_querySnapshot = await getDocs(appeared_q);
    appeared_querySnapshot.forEach((doc) => {
      appeared_asmts[doc.data()[fbc.STDASMT_ASMTUID]] = doc.data();
    });
    setappearedasmts(appeared_asmts);
    utility.hideloading();
  }

  return (
    <div>
      <div
        className="d-flex flex-column flex-root app-root mh-100"
        style={{ height: '100vh' }}
        id="kt_app_root"
      >
        <div
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={'Attempted Assessments'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-2 mh-100 scroll"
              id="kt_app_main"
            >
              <div className="card h-100">
                <div className="card-header p-4">
                  <div className="card-title d-flex flex-row justify-content-between align-items-center w-100 mb-0 m-0">
                    <div className="d-flex flex-row align-items-center gap-4">
                      <div className="d-flex flex-column">
                        <span className="fs-1 mb-1 fw-bolder">
                          Attempted Assessments
                        </span>

                        <span className="fs-6 text-muted">
                          {utility.padwithzero(
                            Object.keys(appearedasmts).length
                          )}{' '}
                          Assesments
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-body p-2 d-flex flex-column "
                  id="contentdiv"
                >
                  <div
                    className="tab-content h-100"
                    id="lessontabContent_live"
                  ></div>
                </div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptedAssessments;
export async function getStaticProps() {
  return {
    props: { module: 'STUDENTSUBJECTDETAILS', onlyAdminAccess: false },
  };
}
