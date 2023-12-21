import { USER_COURSES, USER_FULLNAME } from '@/constants/appconstants';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import SelectWorksheet from '../../components/student/select-worksheet';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';
const StudentHome = () => {
  const [selectWorksheetModal, setselectWorksheetModal] = useState(null);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [courseDetails, setcourseDetails] = useState(null);
  const [subjectList, setsubjectList] = useState([]);
  const [curricularcoursesList, setcurricularcoursesList] = useState([]);
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

  async function fetchCoursedetails() {
    if (utility.get_keyvalue(USER_COURSES).length === 0) {
      window.history.replaceState(null, null, '/student/select-course');
      window.location = '/student/select-course';
      return
    }
    fetchCoursesForCurriular()
    utility.showloading();
    const docRef = doc(db, fbc.COURSE_COLLECTION, utility.get_keyvalue(USER_COURSES)[0].uid);
    const docSnap = await getDoc(docRef);
    utility.hideloading();
    if (docSnap.exists()) {
      setcourseDetails(docSnap.data());

    } else {
      setcourseDetails(null);
    }
  }

  useEffect(() => { getSubjectsForCourse() }, [courseDetails])

  async function getSubjectsForCourse() {
    setsubjectList([])
    if (courseDetails === null) { return }
    utility.showloading();
    try {
      const SubjectReF = collection(db, fbc.SUBJECT_COLLECTION);
      var allSubjects = [];
      var params = [
        where(`${fbc.SUBJECT_COURSE}.uid`, "==", courseDetails[fbc.COURSE_UID]),
        where(`${fbc.SUBJECT_STATUS}`, "==", true),
      ];

      let q = query(SubjectReF,
        ...params,
        orderBy(fbc.SUBJECT_NAME));
      const querySnapshot = await getDocs(q);
      console.log("size L " + querySnapshot.size);
      querySnapshot.forEach((doc) => {
        allSubjects.push(doc.data());
      });
      setsubjectList(allSubjects);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }
    utility.hideloading()
  }

  function viewSubject(subjectuid) {
    window.open(
      window.location.origin + '/student/subject-details?view=' + subjectuid,
    );
  }

  async function fetchCoursesForCurriular() {

    setcurricularcoursesList([])
    var allCourses = [];
    utility.showloading();
    const docRef = collection(db, fbc.COURSE_COLLECTION);
    let q = query(docRef,
      where(`${fbc.COURSE_BOARD}.code`, "==", "EXTRACURRICULAR"),
      orderBy(fbc.COURSE_NAME));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      allCourses.push(doc.data());
    });
    setcurricularcoursesList(allCourses);
  }

  function queryCourseType(type) {
    console.log(type);
    console.log(curricularcoursesList);
    curricularcoursesList.map(course => {
      if (course[fbc.COURSE_CODE] === type + "_" + courseDetails[fbc.COURSE_CODE]) {
        window.open(
          window.location.origin + '/student/course?view=' + course[fbc.COURSE_UID],
        );
      }
    })
  }

  useEffect(() => { }, []);
  const handleReadyScript = () => {
    console.log('SCRIPT Ready');
    fetchCoursedetails()
  };

  const handleLoadScript = () => {
    console.log('SCRIPT LOADED');
  };
  const handleLoadErrorScript = (e) => {
    console.log('SCRIPT Error', e);

    showsnackbar('error', 'Failed To Load Script');
  };

  return (
    <div>
      <Script
        onReady={handleReadyScript}
        onLoad={handleLoadScript}
        onError={handleLoadErrorScript}
        src="../../../assets/plugins/datatables/datatables.bundle.js"
      />
      <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
        <div className="w-100 h-100 position-absolute"
          style={{
            opacity: 0.05,
            backgroundColor: courseDetails != null ? (fbc.COURSECOLORS[courseDetails?.[fbc.COURSE_COLOR]] || [fbc.COURSECOLORS.YELLOW]) : "#FFF"
          }} />
        <div
          className="app-page flex-column flex-column-fluid"

          id="kt_app_page"
        >

          <Header title={'Home'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />

            <div
              className="app-main flex-column flex-row-fluid py-2 px-4"
              id="kt_app_main"
            >

              <div className="row g-5 g-xl-10">
                <div className="col-xl-12 mb-xl-10">
                  <div className="card  rounded-4 bg-transparent card-flush h-xl-100">
                    <div
                      className="card-header rounded-4  align-items-start h-200px"
                      style={{
                        backgroundColor: "#FF8989",
                      }}
                    >
                      <h3 className="card-title align-items-center justify-content-between w-100 flex-row pt-5 px-0  mb-3">
                        <div className="d-flex flex-column mb-auto ">
                          <span className="fs-3x fs-md-5 my-2 text-white fw-bolder">Hi {utility.get_keyvalue(USER_FULLNAME)}!</span>
                          <span className="fs-1x fs-md-5 mb-2 fw-semibold text-white">What do you wanna do today?</span>
                        </div>
                      </h3>
                    </div>

                    <div className="card-body bg-none mt-n10 px-3">
                      <div className="mt-n20 position-relative">
                        <div className="d-flex flex-row flex-wrap gap-0 mb-2">
                          <div className="w-50 mw-200px h-120px px-2 pb-4">
                            <a
                              onClick={(e) => {
                                window.location = '/student/course'
                              }}

                              className="shadow rounded-4  card d-flex flex-column align-content-center justify-content-center">

                              <div className="card-body d-flex ">
                                <img
                                  className="img-fluid h-100px m-auto" src="../../assets/images/teach.svg"></img>
                              </div>
                              <div className="card-footer d-flex px-2 py-3">
                                <span className="fs-4 fs-md-6 text-center mx-auto fw-bolder">Syllabus</span>
                              </div>



                            </a>
                          </div>
                          <div className="w-50 mw-200px h-120px px-2 pb-4">
                            <a
                              onClick={(e) => {
                                selectWorksheetModal.show()
                              }}

                              className="shadow rounded-4  card d-flex flex-column align-content-center justify-content-center">

                              <div className="card-body d-flex ">
                                <img
                                  className="img-fluid h-100px m-auto" src="../../assets/images/study.svg"></img>
                              </div>
                              <div className="card-footer d-flex px-2 py-3">
                                <span className="fs-4 fs-md-6 text-center mx-auto fw-bolder">
                                  Worksheets</span>
                              </div>



                            </a>
                          </div>
                          <div className="w-50 mw-200px h-120px px-2 pb-4">
                            <a
                              onClick={(e) => {
                                window.location = '/student/live-assessments'
                              }}

                              className="shadow rounded-4  card d-flex flex-column align-content-center justify-content-center">

                              <div className="card-body d-flex ">
                                <img
                                  className="img-fluid h-100px m-auto" src="../../assets/images/checklist.svg"></img>
                              </div>
                              <div className="card-footer d-flex px-2 py-3">
                                <span className="fs-4 fs-md-6 text-center mx-auto fw-bolder">
                                  Assessments</span>
                              </div>



                            </a>
                          </div>
                          <div className="w-50 mw-200px h-120px px-2 pb-4">
                            <a
                              onClick={(e) => {
                                queryCourseType('GENERAL_KNOWLEDGE')
                              }}

                              className="shadow rounded-4  card d-flex flex-column align-content-center justify-content-center">

                              <div className="card-body d-flex ">
                                <img
                                  className="img-fluid h-100px m-auto" src="../../assets/images/idea.svg"></img>
                              </div>
                              <div className="card-footer d-flex px-2 py-3">
                                <span className="fs-4 fs-md-6 text-center mx-auto fw-bolder">
                                  General
                                  Knowledge</span>
                              </div>



                            </a>
                          </div>
                          <div className="w-50 mw-200px h-120px px-2 pb-4">
                            <a
                              onClick={(e) => {
                                queryCourseType('WATCH_EXTRA_VIDEOS')
                              }}

                              className="shadow rounded-4  card d-flex flex-column align-content-center justify-content-center">

                              <div className="card-body d-flex ">
                                <img
                                  className="img-fluid h-100px m-auto" src="../../assets/images/learning.svg"></img>
                              </div>
                              <div className="card-footer d-flex px-2 py-3">
                                <span className="fs-4 fs-md-6 text-center mx-auto fw-bolder">
                                  Extra Videos</span>
                              </div>



                            </a>
                          </div>
                          <div className="w-50 mw-200px h-120px px-2 pb-4">
                            <a
                              onClick={(e) => {
                                queryCourseType('OLYMPIAD')
                              }}

                              className="shadow rounded-4  card d-flex flex-column align-content-center justify-content-center">

                              <div className="card-body d-flex ">
                                <img
                                  className="img-fluid h-100px m-auto" src="../../assets/images/trophy.svg"></img>
                              </div>
                              <div className="card-footer d-flex px-2 py-3">
                                <span className="fs-4 fs-md-6 text-center mx-auto fw-bolder">
                                  Olympiad</span>
                              </div>



                            </a>
                          </div>
                          <div className="w-50 mw-200px h-120px px-2 pb-4">
                            <a
                              onClick={(e) => {
                                queryCourseType('WORLD_NEWS')
                              }}

                              className="shadow rounded-4  card d-flex flex-column align-content-center justify-content-center">

                              <div className="card-body d-flex ">
                                <img
                                  className="img-fluid h-100px m-auto" src="../../assets/images/globe.svg"></img>
                              </div>
                              <div className="card-footer d-flex px-2 py-3">
                                <span className="fs-4 fs-md-6 text-center mx-auto fw-bolder">
                                  World NEWS</span>
                              </div>



                            </a>
                          </div>
                          <div className="w-50 mw-200px h-120px px-2 pb-4">
                            <a
                              onClick={(e) => {
                                queryCourseType('LEARN_365')
                              }}

                              className="shadow rounded-4  card d-flex flex-column align-content-center justify-content-center">

                              <div className="card-body d-flex ">
                                <img
                                  className="img-fluid h-100px m-auto" src="../../assets/images/homeschooling.svg"></img>
                              </div>
                              <div className="card-footer d-flex px-2 py-3">
                                <span className="fs-4 fs-md-6 text-center mx-auto fw-bolder">
                                  Learn 365</span>
                              </div>



                            </a>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>



            </div>
          </div>
        </div>
      </div>

      <SelectWorksheet setselectWorksheetModal={setselectWorksheetModal} />
    </div>
  );
};

export default StudentHome;
export async function getStaticProps() {
  return {
    props: { module: 'STUDENTHOME', onlyAdminAccess: false },
  };
}
