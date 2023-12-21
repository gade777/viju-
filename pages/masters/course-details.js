
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import SubjectList from '../../components/masters/subjectlist';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';

const CourseDetails = () => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [courseDetails, setcourseDetails] = useState(null);
  const [courseUID, setCourseUID] = useState(null);
  const [subjectUID, setSubjectUID] = useState(null);


  useEffect(() => {
    let uid = router.query.view;
    let subjectuid = router.query?.subject;
    console.log({ uid, subjectuid });
    setSubjectUID(() => {
      return subjectuid
    })
    setCourseUID(() => {
      return uid
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
    if (courseUID !== null && courseUID !== undefined) {
      console.log(courseUID);
      fetchCoursedetails(courseUID);
    }
  }, [courseUID]);



  async function fetchCoursedetails(uid) {
    utility.showloading();
    const docRef = doc(db, fbc.COURSE_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    utility.hideloading();
    if (docSnap.exists()) {
      setcourseDetails(docSnap.data());

    } else {
      setcourseDetails(null);
    }
  }


  return (
    <div>

      <div className="d-flex flex-column flex-root app-root mh-100" style={{ height: '100vh' }} id="kt_app_root">
        <div
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={'Course Details'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-2 mh-100 scroll"
              id="kt_app_main"
            >

              {courseDetails != null ? <>

                <div className="card h-100">
                  <div className="card-header py-2 px-4 pb-0">
                    <div className="card-title d-flex flex-row justify-content-between align-items-center w-100 mb-0">
                      <div className="d-flex flex-row align-items-center gap-4">
                        <img src={courseDetails[fbc.COURSE_THUMBNAILURL]} className="mb-2 bg-white rounded  w-100px h-100px"></img>

                        <div className="d-flex flex-column mb-4">
                          <span className="fs-2 mb-1 fw-bolder">{courseDetails[fbc.COURSE_NAME]}</span>
                          <span className="fs-6 text-muted">{courseDetails[fbc.COURSE_CODE] + " | " + courseDetails[fbc.COURSE_BOARD].code + " | " +courseDetails[fbc.COURSE_FIELD]}</span>
                        </div>
                      </div>

                      <div className='d-flex flex-row'>
                        <div className="d-flex flex-column">

                          {
                            courseDetails[fbc.COURSE_STATUS] ? <>
                              <div className="d-flex flex-row justify-content-end">
                                <span className="badge p-3 fs-7 badge-light-success ">
                                  Active
                                </span>
                              </div>
                            </> : <>
                              <div className="d-flex flex-row justify-content-end">
                                <span className="badge p-3 fs-7 badge-light-danger">
                                  In-Active
                                </span>
                              </div>
                            </>

                          }


                          <span className="fs-6 mt-2 text-muted text-end">Last Updated : {courseDetails[fbc.COURSE_LOGS][courseDetails[fbc.COURSE_LOGS].length - 1]["date"]}</span>

                        </div>

                      </div>





                    </div>

                  </div>

                  <div className="card-body p-4 d-flex flex-column " id="contentdiv">
                    <SubjectList courseuid={courseDetails[fbc.COURSE_UID]} subjectuid={subjectUID} />



                  </div>
                  <div>





                  </div>
                </div>
              </> : <></>}

            </div>

          </div>
        </div>
      </div>


    </div>
  );
};

export default CourseDetails;
export async function getStaticProps() {
  return {
    props: { module: 'COURSEMASTER', onlyAdminAccess: false },
  };
}
