
import { USER_COURSES, USER_ID } from '@/constants/appconstants';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';

const LiveAssessments = () => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [asmts, setasmts] = useState([]);
  const [appearedasmts, setappearedasmts] = useState({});


  useEffect(() => {
    getLiveAsmts()
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
    $(`#lessontabContent_live`).empty()
    if (asmts.length === 0) {
      var item = ` <div class="d-flex flex-row bg-white border rounded py-2 px-5 w-100 justify-content-between mb-2 ">

          <div class="d-flex flex-column">
            <span class="fs-5 fw-bold">No Live Assessments Available</span>
          </div>
        </div>`

      $(`#lessontabContent_live`).empty().append(item)
      return;
    }

    asmts.map(asmt => {

      var appearedStatus = ``

      if (appearedasmts[asmt[fbc.ASMT_UID]] !== undefined) {
        appearedStatus = `<span class="badge py-3 px-4 rounded-pill fs-8 badge-primary badge me-3">${appearedasmts[asmt[fbc.ASMT_UID]][fbc.STDASMT_STATUS]}</span>`
      }


      var item = ` <div id="asmtdiv_${asmt[fbc.ASMT_UID]}" class="d-flex flex-row bg-light-primary border rounded p-3 justify-content-between mb-2">
      
      <div class="d-flex flex-row align-items-center w-75"> 
      
          <div class="d-flex flex-column">
            <span class="fs-2 fw-bolder text-wrap mb-1">${asmt[fbc.ASMT_TITLE]}</span>

            <span class="text-xs text-dark fw-semibold">${asmt[fbc.ASMT_CODE]} | ${asmt[fbc.ASMT_DURATION]}mins | ${asmt[fbc.ASMT_TOTAL]} Marks</span>
           
          </div>
      </div>

          <div class='d-flex flex-row align-items-center gap-2 py-2'>

          ${appearedStatus}
           
            <button
            id="viewasmt_${asmt[fbc.ASMT_UID]}" class="btn rounded-pill  h-30px px-4 fs-6 py-1 btn-sm btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary">
              <i class="ri-eye-fill fs-5"></i>
              view
            </button>
            
          </div>

        </div>`

      $(`#lessontabContent_live`).append(item)

      $(`#viewasmt_${asmt[fbc.ASMT_UID]}`).on('click', function (e) {
        window.open(
          window.location.origin + '/student/assessment?id=' + this.id.split("_")[1],
          '_blank'
        );
      });
    })

  }, [appearedasmts, asmts]);



  async function getLiveAsmts() {
    const appeared_asmtReF = collection(db, fbc.STDASMT_COLLECTION);
    const appeared_q = query(appeared_asmtReF,
      where(fbc.STDASMT_STUDENT + ".uid", '==', utility.get_keyvalue(USER_ID)));
    var appeared_asmts = []
    const appeared_querySnapshot = await getDocs(appeared_q);
    appeared_querySnapshot.forEach((doc) => {
      appeared_asmts[doc.data()[fbc.STDASMT_ASMTUID]] = doc.data()
    });
    setappearedasmts(appeared_asmts)
    utility.hideloading()

    console.log(utility.get_keyvalue(USER_COURSES));
    const asmtReF = collection(db, fbc.ASMT_COLLECTION);
    const q = query(asmtReF,
      where(fbc.ASMT_ISLIVE, '==', true),
      where(fbc.ASMT_STATUS, '==', true),
      where(fbc.ASMT_COURSE + ".uid", '==', utility.get_keyvalue(USER_COURSES)[0].uid),
      orderBy(fbc.ASMT_CODE));
    var asmts = []
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      asmts.push(doc.data())
    });
    setasmts(asmts)
    utility.hideloading()
  }




  return (
    <div>

      <div className="d-flex flex-column flex-root app-root mh-100" style={{ height: '100vh' }} id="kt_app_root">
        <div
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={'Assessments'} />

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
                        <span className="fs-1 mb-1 fw-bolder">Live Assessments</span>

                        <span className="fs-6 text-muted">{utility.padwithzero(asmts.length)} Assesments</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="card-body p-2 d-flex flex-column " id="contentdiv">

                  <div className="tab-content h-100" id="lessontabContent_live">




                  </div>



                </div>
                <div>





                </div>
              </div>

            </div>

          </div>
        </div>
      </div>


    </div>
  );
};

export default LiveAssessments;
export async function getStaticProps() {
  return {
    props: { module: 'STUDENTSUBJECTDETAILS', onlyAdminAccess: false },
  };
}
