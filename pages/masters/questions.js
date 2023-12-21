import { USER_ID, USER_ISADMIN } from '@/constants/appconstants';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';
const Questions = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectQuestion, setselectQuestion] = useState(null);
  const [addQuestionModal, setaddQuestionModal] = useState(null);
  const [allQuestionDocs, setQuestionDocs] = useState([]);
  const [allBoardDocs, setBoardDocs] = useState([]);
  const [boardchoices, setBoardschoices] = useState(null);
  const [coursechoices, setCourseschoices] = useState(null);
  const [subjectchoices, setSubjectschoices] = useState(null);
  const [lessonchoices, setLessonschoices] = useState(null);
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
    if (boardchoices === undefined || boardchoices === null) { return; }

    boardchoices.passedElement.element.addEventListener(
      "addItem",
      function (event) {
        if (event.detail.value !== "") {
          getAllCourses(event.detail.value)
        }
      }, false);
    getAllBoards()
  }, [boardchoices])

  useEffect(() => {
    if (coursechoices === undefined || coursechoices === null) { return; }

    coursechoices.passedElement.element.addEventListener(
      "addItem",
      function (event) {
        if (event.detail.value !== "") {
          getAllSubjects(event.detail.value)
        }
      }, false);
  }, [coursechoices])


  useEffect(() => {
    if (subjectchoices === undefined || subjectchoices === null) { return; }

    subjectchoices.passedElement.element.addEventListener(
      "addItem",
      function (event) {
        if (event.detail.value !== "") {
          getAllLessons(event.detail.value)
        }
      }, false);
  }, [subjectchoices])

  useEffect(() => {
    if (lessonchoices === undefined || lessonchoices === null) { return; }

    lessonchoices.passedElement.element.addEventListener(
      "addItem",
      function (event) {
        if (event.detail.value !== "") {
          getAllQuestions(event.detail.value)
        }
      }, false);
  }, [lessonchoices])
  async function getAllSubjects(course_uid) {
    $("#contentdiv").empty()
    console.log(course_uid);
    utility.showloading();
    try {
      const ref = collection(db, fbc.SUBJECT_COLLECTION);
      var allSubjects = [];

      var params = [];
      if (!utility.get_keyvalue(USER_ISADMIN)) {
        params.push(where(fbc.SUBJECT_ACCESSUSERUIDARRAY, "array-contains", utility.get_keyvalue(USER_ID)))
      }

      const q = query(ref,
        ...params,
        where(fbc.SUBJECT_COURSE + ".uid", "==", course_uid),
        orderBy(fbc.SUBJECT_CODE));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allSubjects.push(doc.data());
      });

      var subjectArray = [
        { value: "", label: "Select Subject", placeholder: true, disabled: true, selected: true },]
      allSubjects.map((board) => {
        subjectArray.push({
          value: board[fbc.SUBJECT_UID],
          customProperties: board,
          label: board[fbc.SUBJECT_NAME]
        })
      })
      subjectchoices.clearChoices().setChoices(subjectArray)
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    utility.hideloading();
  }
  async function getAllLessons(subject_uid) {
    $("#contentdiv").empty()
    console.log(subject_uid);
    utility.showloading();
    try {
      const ref = collection(db, fbc.LESSON_COLLECTION);
      var allLessons = [];

      var params = [];
      if (!utility.get_keyvalue(USER_ISADMIN)) {
        params.push(where(fbc.LESSON_ASSESMENTUIDARRAY, "array-contains", utility.get_keyvalue(USER_ID)))
      }

      const q = query(ref,
        ...params,
        where(fbc.LESSON_SUBJECT + ".uid", "==", subject_uid),
        orderBy(fbc.LESSON_CODE));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allLessons.push(doc.data());
      });

      var lessonArray = [
        { value: "", label: "Select Course", placeholder: true, disabled: true, selected: true },]
      allLessons.map((board) => {
        lessonArray.push({
          value: board[fbc.LESSON_UID],
          customProperties: board,
          label: board[fbc.LESSON_NAME]
        })
      })
      lessonchoices.clearChoices().setChoices(lessonArray)
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    utility.hideloading();
  }
  async function getAllCourses(board_uid) {
    $("#contentdiv").empty()
    utility.showloading();
    try {
      const ref = collection(db, fbc.COURSE_COLLECTION);
      var allCourses = [];

      var params = [];
      if (!utility.get_keyvalue(USER_ISADMIN)) {
        params.push(where(fbc.COURSE_ACCESSUSERUIDARRAY, "array-contains", utility.get_keyvalue(USER_ID)))
      }

      const q = query(ref,
        ...params,
        where(fbc.COURSE_BOARD + ".uid", "==", board_uid),
        orderBy(fbc.COURSE_NAME));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allCourses.push(doc.data());
      });

      var courseArray = [
        { value: "", label: "Select Course", placeholder: true, disabled: true, selected: true },]
      allCourses.map((board) => {
        courseArray.push({
          value: board[fbc.COURSE_UID],
          customProperties: board,
          label: board[fbc.COURSE_NAME]
        })
      })
      coursechoices.clearChoices().setChoices(courseArray)
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    utility.hideloading();
  }

  async function getAllBoards() {
    $("#contentdiv").empty()
    utility.showloading();
    try {
      const BoardReF = collection(db, fbc.BOARD_COLLECTION);
      var allBoards = [];
      var params = [];
      if (!utility.get_keyvalue(USER_ISADMIN)) {
        params.push(where(fbc.BOARD_ACCESSUSERUIDARRAY, "array-contains", utility.get_keyvalue(USER_ID)))
      }
      let q = query(BoardReF,
        ...params,
        orderBy(fbc.BOARD_NAME));
      const querySnapshot = await getDocs(q);
      console.log("size L " + querySnapshot.size);
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

      var boardsArray = [
        { value: "", label: "Select Board", placeholder: true, disabled: true, selected: true },]
      allBoards.map((board) => {
        boardsArray.push({
          value: board.uid,
          customProperties: board,
          label: board.name
        })
      })
      boardchoices.clearChoices().setChoices(boardsArray)

    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }
    utility.hideloading();
  }
  useEffect(() => {
    if (selectQuestion == null) {
      return;
    }
    addQuestionModal.show();
  }, [selectQuestion]);
  function addNewQuestion(questiontype) {
    window.open(
      window.location.origin + '/masters/edit-question?view=' + questiontype,
      '_blank'
    );

  }
  function viewQuestion(question_uid) {

  }
  function modifyQuestion(question_uid, questiontype) {
    window.open(
      window.location.origin + '/masters/edit-question?view=' + questiontype + "&question=" + question_uid,
      '_blank'
    );
  }

  async function getAllQuestions(lesson_uid) {
    $("#contentdiv").empty()
    console.log(lesson_uid);
    utility.showloading();
    try {
     
      const QuestionReF = collection(db, fbc.QUESTION_COLLECTION);
      var allQuestions = [];
      const q = query(QuestionReF,

        where(fbc.QUESTION_LESSONSUID, "array-contains", lesson_uid),
        orderBy(fbc.QUESTION_CODE));
      const querySnapshot = await getDocs(q);
      console.log("size r " + querySnapshot.size);
      querySnapshot.forEach((doc) => {
        allQuestions.push(doc.data());
      });
      setQuestionDocs(allQuestions);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    utility.hideloading();
  }

  useEffect(() => {
    if (allQuestionDocs.length > 0) {
      var tableid = utility.randomstring()
      createTable(tableid)

      allQuestionDocs.map((questionDoc, index) => {
        var active = `<span class="badge p-3 fs-7 badge-light-success">
                            Active
                          </span>`;
        var inactive = `<span class="badge p-3 fs-7 badge-light-danger">
                            In-Active
                          </span>`;

        var rowitem = `<tr>
                        <td class="text-gray-800 mb-1">${index + 1}.</td>
                        <td class="text-gray-800 mb-1">${questionDoc[fbc.QUESTION_TYPE]
          }</td>
                        <td class="text-gray-800 mb-1">${questionDoc[fbc.QUESTION_CODE]
          }</td>
                        <td class="text-gray-800 mb-1">${questionDoc[fbc.QUESTION_TEXT]
          }</td>

                        <td>
                          ${questionDoc[fbc.QUESTION_STATUS] ? active : inactive
          }
                        </td>

                        <td class="text-end">
                          <button
                          data-type="${questionDoc[fbc.QUESTION_TYPE]}"
                          id="modify_${questionDoc[fbc.QUESTION_UID]}" class="btn btn-sm btn-light btn-active-light-primary m-1">
                            MODIFY
                          </button>
                        </td>
                      </tr>`;

        $('#' + tableid + '-Questionstablebody').append(rowitem);
        $('#modify_' + questionDoc[fbc.QUESTION_UID]).on('click', function () {
          modifyQuestion(this.id.replaceAll("modify_", ""), $("#" + this.id).data("type"));
        });
        // $('#view_' + questionDoc[fbc.QUESTION_UID]).on('click', function () {
        //   viewQuestion(this.id.replaceAll("view_", ""));
        // });
      });

      var datatable = $('#' + tableid + '-Questionstable').DataTable({
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
          { width: '5%', targets: [0, 1, 5] },
          { width: '15%', targets: [3, 4] },
        ],
      });

      $('#searchbox').keyup(function () {
        datatable.search(this.value).draw();
      });
      $('.dataTables_filter').addClass('d-none');
    }
  }, [allQuestionDocs]);


  function createTable(tableid) {
    var table = `<table
                    class="table align-middle table-row-dashed fs-6 gy-5"
                    id="${tableid}-Questionstable"
                  >
                    <thead>
                      <tr class="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                        <th class="py-0 px-3">#</th>
                        <th class="py-0 px-3 min-w-125px">Type</th>
                        <th class="py-0 px-3 min-w-125px">Code</th>
                        <th class="py-0 px-3 min-w-125px">Question</th>
                        <th class="py-0 px-3 min-w-125px">Status</th>
                        <th class="py-0 px-3 text-end min-w-70px">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody
                      id="${tableid}-Questionstablebody"
                      class="fw-semibold text-gray-600"
                    ></tbody>
                  </table>`
    $("#contentdiv").empty().append(table)

  }

  useEffect(() => { }, []);
  const handleReadyScript = () => {
    console.log('SCRIPT Ready');

    setBoardschoices(
      new Choices($("#boardselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: false,
        resetScrollPosition: false,
        placeholderValue: "",
        itemSelectText: "",
        classNames: {
          containerInner: "choices__inner bg-white rounded d-flex text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
          listSingle: 'choices__list--single my-auto',
        },
        choices: [
          { value: "", label: "Select Course", placeholder: true, disabled: true, selected: true },],

      })
    );

    setCourseschoices(
      new Choices($("#courseselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: false,
        resetScrollPosition: false,
        placeholderValue: "",
        itemSelectText: "",
        classNames: {
          containerInner: "choices__inner bg-white rounded d-flex text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
          listSingle: 'choices__list--single my-auto',
        },
        choices: [
          { value: "", label: "Select Course", placeholder: true, disabled: true, selected: true },],

      })
    );

    setSubjectschoices(
      new Choices($("#subjectselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: false,
        resetScrollPosition: false,
        placeholderValue: "",
        itemSelectText: "",
        classNames: {
          containerInner: "choices__inner bg-white rounded d-flex text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
          listSingle: 'choices__list--single my-auto',
        },
        choices: [
          { value: "", label: "Select Subject", placeholder: true, disabled: true, selected: true },],
      })
    );

    setLessonschoices(
      new Choices($("#lessonselect")[0], {
        addItems: true,
        placeholder: true,
        removeItemButton: false,
        resetScrollPosition: false,
        placeholderValue: "",
        itemSelectText: "",
        classNames: {
          containerInner: "choices__inner bg-white rounded d-flex text-dark fw-bold text-sm",
          item: "choices__item pe-2 mb-0 text-sm",
          listSingle: 'choices__list--single my-auto',
        },
        choices: [
          { value: "", label: "Select Lesson", placeholder: true, disabled: true, selected: true },],
      })
    );
  };

  const handleLoadScript = () => {
    console.log('SCRIPT LOADED');
  };
  const handleLoadErrorScript = (e) => {
    console.log('SCRIPT Error', e);

    showsnackbar('error', 'Failed To Load Script');
  };
  function uploadexcel() {
    window.open(
      window.location.origin + '/masters/questions-upload',
      '_blank'
    );
  }
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
          <Header title={'Questions'} />

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
                      className="d-flex justify-content-end"
                      data-kt-customer-table-toolbar="base"
                    >

                      <div className="d-flex flex-row gap-2 me-4 border-end pe-4">
                        <div className="fv-row" style={{ width: "200px" }}>
                          <select id="boardselect"></select>
                        </div>
                        <div className="fv-row" style={{ width: "200px" }}>
                          <select id="courseselect"></select>
                        </div>
                        <div className="fv-row" style={{ width: "200px" }}>
                          <select id="subjectselect"></select>
                        </div>
                        <div className="fv-row" style={{ width: "200px" }}>
                          <select id="lessonselect"></select>
                        </div>
                      </div>

                      <a href="#" className="btn btn-sm fs-5 btn-light-primary  btn-flex btn-center btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">Add Question
                        <i className="ri-arrow-drop-down-line fs-5 ms-1"></i></a>

                      <button
                        type="button"
                        className="btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary fs-5 ms-2"
                        onClick={(e) => uploadexcel()}
                      >
                        Upload Excel
                      </button>

                      <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-200px py-4" data-kt-menu="true">
                        <div className="menu-item px-3">

                          <a
                            onClick={(e) => addNewQuestion("MCQ")} className="menu-link px-3">Multiple Choice Question</a>
                        </div>
                        <div className="menu-item px-3">

                          <a
                            onClick={(e) => addNewQuestion("FTB")} className="menu-link px-3">Fill In The Blanks</a>
                        </div>
                        <div className="menu-item px-3">
                          <a
                            onClick={(e) => addNewQuestion("MTF")} className="menu-link px-3">Match The Following</a>
                        </div>
                        <div className="menu-item px-3">
                          <a
                            onClick={(e) => addNewQuestion("OQA")} className="menu-link px-3">Objective Ques-Ans</a>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="card-body p-4" id="contentdiv">

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Questions;
export async function getStaticProps() {
  return {
    props: { module: 'COURSEMASTER', onlyAdminAccess: false },
  };
}
