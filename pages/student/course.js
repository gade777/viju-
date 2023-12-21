import { USER_COURSES } from '@/constants/appconstants';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';
const StudentHome = () => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [courseDetails, setcourseDetails] = useState(null);
  const [selectedcourseUID, setCourseUID] = useState(null);
  const [subjectList, setsubjectList] = useState([]);
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
      return;
    }

    var courseuid =
      selectedcourseUID === null
        ? utility.get_keyvalue(USER_COURSES)[0].uid
        : selectedcourseUID;
    utility.showloading();
    console.log(courseuid);
    const docRef = doc(db, fbc.COURSE_COLLECTION, courseuid);
    const docSnap = await getDoc(docRef);
    utility.hideloading();
    if (docSnap.exists()) {
      setcourseDetails(docSnap.data());
    } else {
      setcourseDetails(null);
    }
  }

  useEffect(() => {
    if (selectedcourseUID !== null) {
      fetchCoursedetails();
    }
  }, [selectedcourseUID]);
  useEffect(() => {
    getSubjectsForCourse();
  }, [courseDetails]);

  async function getSubjectsForCourse() {
    setsubjectList([]);
    if (courseDetails === null) {
      return;
    }
    utility.showloading();
    try {
      const SubjectReF = collection(db, fbc.SUBJECT_COLLECTION);
      var allSubjects = [];
      var params = [
        where(`${fbc.SUBJECT_COURSE}.uid`, '==', courseDetails[fbc.COURSE_UID]),
        where(`${fbc.SUBJECT_STATUS}`, '==', true),
      ];

      let q = query(SubjectReF, ...params, orderBy(fbc.SUBJECT_NAME));
      const querySnapshot = await getDocs(q);
      console.log('size L ' + querySnapshot.size);
      querySnapshot.forEach((doc) => {
        allSubjects.push(doc.data());
      });
      setsubjectList(allSubjects);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }
    utility.hideloading();
  }

  function viewSubject(subjectuid) {
    window.open(
      window.location.origin + '/student/subject-details?view=' + subjectuid
    );
  }

  useEffect(() => {
    let courseuid = router.query?.view || null;

    if (courseuid !== null) {
      setCourseUID(() => {
        return courseuid;
      });
    } else {
      fetchCoursedetails();
    }
  }, []);

  function getSortedLessonsFromSubject(subject) {
    var lessonsArray = [];

    Object.keys(subject[fbc.SUBJECT_LESSONS]).map((key, index) => {
      lessonsArray.push(subject[fbc.SUBJECT_LESSONS][key]);
    });
    lessonsArray.sort(function (x, y) {
      let a = Number(
          x.code.split('-')[x.code.split('-').length - 1].replaceAll('L', '')
        ),
        b = Number(
          y.code.split('-')[y.code.split('-').length - 1].replaceAll('L', '')
        );
      return a == b ? 0 : a > b ? 1 : -1;
    });
    return lessonsArray;
  }

  const handleReadyScript = () => {
    console.log('SCRIPT Ready');
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
        <div
          className="w-100 h-100 position-absolute"
          style={{
            opacity: 0.05,
            backgroundColor:
              courseDetails != null
                ? fbc.COURSECOLORS[courseDetails?.[fbc.COURSE_COLOR]] || [
                    fbc.COURSECOLORS.YELLOW,
                  ]
                : '#FFF',
          }}
        />
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
              className="app-main flex-column flex-row-fluid py-2 px-4 bg-coursered"
              id="kt_app_main"
            >
              {selectedcourseUID == null ? (
                <>
                  <div
                    style={{
                      backgroundColor:
                        courseDetails != null
                          ? fbc.COURSECOLORS[
                              courseDetails?.[fbc.COURSE_COLOR]
                            ] || [fbc.COURSECOLORS.YELLOW]
                          : '#FFF',
                    }}
                    className="rounded-4 h-150px my-2"
                  ></div>
                  <div className="container-fluid px-0">
                    <div className="d-flex flex-row flex-nowrap gap-2 hover-scroll-x">
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                      <div
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        className="rounded-4 col-4 col-lg-1 h-150px my-2 card"
                      ></div>
                    </div>
                  </div>
                  <br />
                </>
              ) : (
                <>
                  <br />
                </>
              )}

              {courseDetails != null ? (
                <>
                  <div className="d-flex flex-column mb-4">
                    <span className="fs-1 mb-1 fw-bolder">
                      {courseDetails[fbc.COURSE_NAME]}
                    </span>
                    {selectedcourseUID == null ? (
                      <>
                        {' '}
                        <span className="fs-4 fw-semibold text-muted">
                          {courseDetails[fbc.COURSE_BOARD].code +
                            ' | ' +
                            courseDetails[fbc.COURSE_BOARD].name +
                            ' | ' +
                            courseDetails[fbc.COURSE_BOARD].field}
                        </span>{' '}
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              ) : (
                <></>
              )}
              <ul
                id="subjecttabs"
                className="nav nav-tabs scroll border-0 flex-nowrap text-nowrap  my-2"
              >
                {subjectList.map((subject, index) => {
                  return (
                    <li key={subject[fbc.SUBJECT_UID]} className="nav-item g-5">
                      <button
                        className={
                          'nav-link rounded-pill text-white px-7 fs-4 btn btn-active-primary fw-bolder  py-2 me-2 text-uppercase ' +
                          (index === 0 ? 'active' : '')
                        }
                        style={{
                          backgroundColor:
                            courseDetails != null
                              ? fbc.COURSECOLORS[
                                  courseDetails?.[fbc.COURSE_COLOR]
                                ] || [fbc.COURSECOLORS.YELLOW]
                              : '#FFF',
                        }}
                        data-bs-toggle="tab"
                        id={subject[fbc.SUBJECT_UID]}
                        href={'#tab_' + subject[fbc.SUBJECT_UID]}
                      >
                        {subject[fbc.SUBJECT_NAME]}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="tab-content h-100 mt-3 " id="subjectTabContent">
                {subjectList.map((subject, index) => {
                  return (
                    <div
                      key={subject[fbc.SUBJECT_UID]}
                      className={
                        'tab-pane fade w-100 h-100  show  ' +
                        (index === 0 ? 'active' : '')
                      }
                      id={'tab_' + subject[fbc.SUBJECT_UID]}
                      role="tabpanel"
                    >
                      <div className="d-flex flex-row flex-wrap justify-content-start gap-2 ">
                        {[...getSortedLessonsFromSubject(subject)].map(
                          (lesson) => {
                            return (
                              <a
                                key={lesson.uid}
                                onClick={(e) => {
                                  window.location =
                                    '/student/lesson?view=' +
                                    subject[fbc.SUBJECT_UID] +
                                    '&lesson=' +
                                    lesson.uid;
                                }}
                                className="w-3div mw-250px"
                              >
                                <div className="card rounded-4 h-100 ">
                                  <img
                                    className="bg-white w-100 img-fluid rounded-top-4 card-img-top"
                                    src={lesson.thumbnail_url}
                                  ></img>
                                  <div className="card-footer px-2 py-1">
                                    <div className="d-flex flex-column mb-auto">
                                      <span className="fs-7 fs-md-5 mb-2 fw-bolder">
                                        {lesson.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </a>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
export async function getStaticProps() {
  return {
    props: { module: 'STUDENTHOME', onlyAdminAccess: false },
  };
}
