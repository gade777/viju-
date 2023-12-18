import { USER_ID, USER_ISADMIN } from '@/constants/appconstants';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import AddorUpdateCourse from '../../components/masters/add-update-courses';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';
const Courses = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectCourse, setselectCourse] = useState(null);
  const [addCourseModal, setaddCourseModal] = useState(null);
  const [allCourseDocs, setCourseDocs] = useState([]);
  const [allBoardDocs, setBoardDocs] = useState([]);
  const [boardchoices, setBoardschoices] = useState(null);
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
    if (selectCourse == null) {
      return;
    }
    addCourseModal.show();
  }, [selectCourse]);
  function addNewCourse() {
    setselectCourse(() => {
      return null;
    });
    addCourseModal.show();
  }

  useEffect(() => {
    if (allBoardDocs.length == 0) {
      return;
    }
    var boardsArray = [
      {
        value: '',
        label: 'Select Course',
        placeholder: true,
        disabled: true,
        selected: true,
      },
    ];
    allBoardDocs.map((board) => {
      boardsArray.push({
        value: board.uid,
        customProperties: board,
        label: board.name,
      });
    });
    console.log({ boardsArray });
    setBoardschoices(
      new Choices($('#courseboardselect')[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: false,
        resetScrollPosition: false,
        placeholderValue: '',
        itemSelectText: '',
        classNames: {
          containerInner:
            'choices__inner bg-white rounded d-flex text-dark fw-bold text-sm',
          item: 'choices__item pe-2 mb-0 text-sm',
          listSingle: 'choices__list--single my-auto',
        },
        choices: boardsArray,
      })
    );
  }, [allBoardDocs]);
  useEffect(() => {
    if (boardchoices === undefined || boardchoices === null) {
      return;
    }

    boardchoices.passedElement.element.addEventListener(
      'addItem',
      function (event) {
        resetTable();

        if (event.detail.value !== '') {
          getAllCourses(event.detail.value);
        }
      },
      false
    );
  }, [boardchoices]);

  async function getAllBoards() {
    utility.showloading();
    try {
      const BoardReF = collection(db, fbc.BOARD_COLLECTION);
      var allBoards = [];
      var params = [];
      if (!utility.get_keyvalue(USER_ISADMIN)) {
        params.push(
          where(
            fbc.BOARD_ACCESSUSERUIDARRAY,
            'array-contains',
            utility.get_keyvalue(USER_ID)
          )
        );
      }
      let q = query(BoardReF, ...params, orderBy(fbc.BOARD_NAME));
      const querySnapshot = await getDocs(q);
      console.log('size L ' + querySnapshot.size);
      querySnapshot.forEach((doc) => {
        allBoards.push({
          details: {
            field: doc.data()[fbc.BOARD_FIELD],
            code: doc.data()[fbc.BOARD_CODE],
            uid: doc.id,
            name: doc.data()[fbc.BOARD_NAME],
          },
          uid: doc.id,
          name: doc.data()[fbc.BOARD_NAME],
        });
      });
      setBoardDocs(allBoards);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }
    utility.hideloading();
  }

  function viewCourse(course_uid) {
    window.open(
      window.location.origin + '/masters/course-details?view=' + course_uid,
      '_blank'
    );
  }
  function modifyCourse(course_uid) {
    setselectCourse((user) => {
      var empDoc = null;
      allCourseDocs.map((courseDoc, index) => {
        if (courseDoc[fbc.COURSE_UID] === course_uid) {
          empDoc = courseDoc;
        }
      });
      console.log({ course_uid, empDoc });
      return empDoc;
    });
    // addCourseModal.show();
  }

  async function getAllCourses(board_uid) {
    utility.showloading();
    try {
      var params = [];
      if (!utility.get_keyvalue(USER_ISADMIN)) {
        params.push(
          where(
            fbc.COURSE_ACCESSUSERUIDARRAY,
            'array-contains',
            utility.get_keyvalue(USER_ID)
          )
        );
      }
      const CourseReF = collection(db, fbc.COURSE_COLLECTION);
      var allCourses = [];
      const q = query(
        CourseReF,
        ...params,
        where(fbc.COURSE_BOARD + '.uid', '==', board_uid),
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

  function resetTable() {
    $('#contentdiv').empty();
  }

  useEffect(() => {
    if (allCourseDocs.length > 0) {
      var id = utility.randomstring() + utility.getTimestamp();

      $('#contentdiv').append(`<table
                    class="table align-middle table-row-dashed fs-6 gy-5"
                    id="${id}"
                  >
                    <thead>
                      <tr class="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                        <th class="py-0 px-3">#</th>
                        <th class="py-0 px-3 min-w-125px">Name</th>
                        <th class="py-0 px-3 min-w-125px">Code</th>
                        <th class="py-0 px-3 min-w-125px">Board</th>
                        <th class="py-0 px-3 min-w-125px">Status</th>
                        <th class="py-0 px-3 text-end min-w-70px">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody
                      id="${id}body"
                      class="fw-semibold text-gray-600"
                    ></tbody>
                  </table>`);

      allCourseDocs.map((courseDoc, index) => {
        var active = `<span class="badge p-3 fs-7 badge-light-success">
                            Active
                          </span>`;
        var inactive = `<span class="badge p-3 fs-7 badge-light-danger">
                            In-Active
                          </span>`;

        var rowitem = `<tr>
                        <td class="text-gray-800 mb-1">${index + 1}.</td>
                        <td class="text-gray-800 mb-1">${
                          courseDoc[fbc.COURSE_NAME]
                        }</td>
                        <td class="text-gray-800 mb-1">${
                          courseDoc[fbc.COURSE_CODE]
                        }</td>
                        <td class="text-gray-800 mb-1">${
                          courseDoc[fbc.COURSE_BOARD].name
                        }</td>

                        <td>
                          ${courseDoc[fbc.COURSE_STATUS] ? active : inactive}
                        </td>

                        <td class="text-end">
                          <button id="modify_${
                            courseDoc[fbc.COURSE_UID]
                          }" class="btn btn-sm btn-light btn-active-light-primary m-1">
                            MODIFY
                          </button>
                          <button id="view_${
                            courseDoc[fbc.COURSE_UID]
                          }" class="btn btn-sm btn-light btn-active-light-primary m-1">
                            VIEW
                          </button>
                        </td>
                      </tr>`;

        $('#' + id + 'body').append(rowitem);
        $('#modify_' + courseDoc[fbc.COURSE_UID]).on('click', function () {
          modifyCourse(this.id.replaceAll('modify_', ''));
        });
        $('#view_' + courseDoc[fbc.COURSE_UID]).on('click', function () {
          viewCourse(this.id.replaceAll('view_', ''));
        });
      });

      var datatable = $('#' + id).DataTable({
        info: false,
        dom: 'Rlfrtip',
        autoWidth: false,
        orderCellsTop: true,
        scrollY: $(window).height() * 0.65 + 'px',
        scrollCollapse: true,
        paging: false,
        scrollX: true,
        fixedHeader: {
          header: true,
          footer: true,
        },
        columnDefs: [
          { width: '5%', targets: [0, 5] },
          { width: '15%', targets: [2, 3, 4] },
        ],
      });

      $('#searchbox').keyup(function () {
        datatable.search(this.value).draw();
      });
      $('.dataTables_filter').addClass('d-none');
    }
  }, [allCourseDocs]);

  useEffect(() => {}, []);
  const handleReadyScript = () => {
    console.log('SCRIPT Ready');
    getAllBoards();
    // KTCustomersList.init();
    // KTCustomersExport.init();
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
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={'Courses'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-4"
              id="kt_app_main"
            >
              <div className="card">
                <div className="card-header py-2 px-4">
                  <div className="card-title">
                    <div className="d-flex align-items-center position-relative my-1">
                      <span className="svg-icon svg-icon-1 position-absolute ms-6">
                        <svg
                          width="24"
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
                        type="text"
                        id="searchbox"
                        className="form-control form-control-solid w-250px ps-15"
                        placeholder="Search"
                      />
                    </div>
                  </div>

                  <div className="card-toolbar">
                    <div
                      className="d-flex justify-content-end gap-2 "
                      data-kt-customer-table-toolbar="base"
                    >
                      <div className="fv-row" style={{ width: '200px' }}>
                        <select id="courseboardselect"></select>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm fs-5 btn-light-primary"
                        // data-bs-toggle="modal"
                        onClick={(e) => addNewCourse()}
                        // data-bs-target="#modal_adduser"
                      >
                        Add Course
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-body p-4" id="contentdiv"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddorUpdateCourse
        setselectCourse={setselectCourse}
        selectCourse={selectCourse}
        setCourseModal={setaddCourseModal}
        allBoardDocs={allBoardDocs}
      />
    </div>
  );
};

export default Courses;
export async function getStaticProps() {
  return {
    props: { module: 'COURSEMASTER', onlyAdminAccess: false },
  };
}
