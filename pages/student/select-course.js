import { USER_COURSES, USER_ID } from '@/constants/appconstants';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';
const Employees = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [courseselected, setcourseselected] = useState(null);
  const [allCourseDocs, setCourseDocs] = useState([]);
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

  async function getSearchCourses() {
    setcourseselected(null);
    if (
      utility.isInputEmpty('searchterm') ||
      utility.getinputValue('searchterm').length < 3
    ) {
      $('#searchterm').addClass('is-invalid');
      var message = 'Please Enter A Valid Search, Minimum 3 Characters.';
      showsnackbar('error', message);
      return false;
    }
    utility.showloading();

    setCourseDocs([]);
    var searchterm = [utility.getinputValue('searchterm')];

    try {
      const CourseReF = collection(db, fbc.COURSE_COLLECTION);
      var allCourses = [];
      const q = query(
        CourseReF,
        where(fbc.COURSE_KEYWORDS, 'array-contains-any', searchterm),
        where(fbc.COURSE_STATUS, '==', true),
        orderBy(fbc.COURSE_NAME)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allCourses.push(doc.data());
      });
      setCourseDocs(allCourses);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    utility.hideloading();
  }

  async function getAllCourses() {
    utility.showloading();
    try {
      const CourseReF = collection(db, fbc.COURSE_COLLECTION);
      var allCourses = [];
      const q = query(
        CourseReF,
        where(fbc.COURSE_STATUS, '==', true),
        orderBy(fbc.COURSE_NAME)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allCourses.push(doc.data());
      });
      setCourseDocs(allCourses);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    utility.hideloading();
  }

  useEffect(() => {
    setcourseselected(null);
    $('#coursesdiv').empty();

    allCourseDocs.map((course) => {
      var item = `<a class="col-lg-1 col-6 p-2 ">
                    <div id="${
                      course[fbc.COURSE_UID]
                    }" class="d-flex flex-column border rounded p-2 coursediv">
                    <img class="w-100 h-150px rounded mx-auto bg-light-success  my-2" src="${
                      course[fbc.COURSE_THUMBNAILURL] ||
                      'https://placehold.co/200'
                    }" />
                    <hr class="my-2 text-muted"/>
                    <span class="fs-5 text-center fw-bold my-0"> ${
                      course[fbc.COURSE_NAME]
                    } </span>
                    

                    </div>
                  </a>`;
      $('#coursesdiv').append(item);

      $('#' + course[fbc.COURSE_UID]).on('click', function () {
        setcourseselected(() => {
          return this.id;
        });
        $('.coursediv').removeClass('bg-light-success');
        $('#' + this.id).addClass('bg-light-success');
        console.log(this.id);
      });
    });
  }, [allCourseDocs]);

  async function savecourse() {
    if (courseselected === null) {
      var message = 'Please Select A Course.';
      showsnackbar('error', message);
      return false;
    }

    utility.showloading();
    var courseDetails = {};
    allCourseDocs.map((course) => {
      if (course[fbc.COURSE_UID] === courseselected) {
        courseDetails = {
          uid: course[fbc.COURSE_UID],
          name: course[fbc.COURSE_UID],
          code: course[fbc.COURSE_CODE],
          date: utility.getDateandTime(),
          timestamp: utility.getTimestamp(),
        };
      }
    });

    try {
      await setDoc(
        doc(db, fbc.STUDENT_COLLECTION, utility.get_keyvalue(USER_ID)),
        {
          [fbc.STUDENT_COURSES]: [courseDetails],
        },
        { merge: true }
      );

      var userCourses = [courseDetails];
      utility.store_newvalue(USER_COURSES, userCourses);
      window.history.replaceState(null, null, '/student/home');
      window.location = '/student/home';
    } catch (error) {
      utility.hideloading();
      showsnackbar('error', error.message);
    }
  }

  useEffect(() => {}, []);
  const handleReadyScript = () => {
    console.log('SCRIPT Ready');
    getAllCourses();
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
      <div
        className="d-flex flex-column flex-root app-root mh-100"
        style={{ height: '100vh' }}
        id="kt_app_root"
      >
        <div
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={'Select Course'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-4"
              id="kt_app_main"
            >
              <div className="card h-100 d-flex">
                <div className="card-header  py-2 px-4">
                  <div className="card-title d-flex flex-row justify-content-between align-items-center w-100 mb-0">
                    <div className="d-flex flex-row align-items-center gap-4">
                      <div className="d-flex flex-column mb-4">
                        <span className="fs-2 mb-1 fw-bolder">
                          Explore Course
                        </span>
                        <span className="fs-6 text-muted">
                          Select Course Which You Want To Enroll For.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="card-body flex-grow-0 p-4 d-flex flex-column "
                  id="contentdiv"
                >
                  <div className="d-flex w-100 gap-2 mb-2 ">
                    <div className="d-flex align-items-center flex-grow-1  border border-secondary rounded ">
                      <span className="svg-icon svg-icon-2 position-absolute ms-3 ">
                        <svg
                          width="100"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            opacity="0.5"
                            x="17.0365"
                            y="15.1223"
                            width="8.15546"
                            height="2"
                            rx="1"
                            transform="rotate(45 17.0365 15.1223)"
                            fill="currentColor"
                          />
                          <path
                            d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>

                      <input
                        id="searchterm"
                        type="text"
                        className="form-control form-control-sm form-control-solid ps-10 "
                        placeholder="Search Courses"
                      />
                    </div>

                    <button
                      onClick={(e) => getSearchCourses()}
                      className="btn btn-light border border-secondary py-2 fw-bold flex-shrink-0"
                    >
                      Search
                    </button>
                  </div>

                  <div
                    className="flex-wrap row bg-primary justify-content-between "
                    id="coursesdiv"
                    data-kt-buttons="true"
                    data-kt-buttons-target=".form-check-image, .form-check-input"
                  ></div>
                </div>
                <div className="card-footer p-2 d-flex ">
                  <button
                    type="submit"
                    id="modal_addcontent_submit"
                    onClick={(e) => savecourse()}
                    className="btn btn-block w-100 px-5x py-3 w-lg-auto ms-auto me-0 btn-success"
                  >
                    <span>Save Selected Course</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
export async function getStaticProps() {
  return {
    props: { module: 'STUDENTHOME', onlyAdminAccess: false },
  };
}
