import { USER_COURSES } from '@/constants/appconstants';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import * as fbc from '@/firebase/firebaseConstants';
import { db } from '@/firebase/firebaseconfig';
import * as utility from '@/libraries/utility';
const SelectWorksheet = ({ setselectWorksheetModal }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [courseDetails, setcourseDetails] = useState(null);
  const [lessons, setlessons] = useState([]);
  const [assesments, setassesments] = useState([]);
  const [subjectList, setsubjectList] = useState([]);
  const [subjectSelected, setsubjectSelected] = useState('');
  const [lessonSelected, setlessonSelected] = useState('');
  const [asmtSelected, setasmtSelected] = useState('');
  const [subjectchoices, setsubjectchoices] = useState(null);
  const [lessonchoices, setlessonchoices] = useState(null);
  const [asmtchoices, setasmtchoices] = useState(null);
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
    if (asmtchoices === undefined || asmtchoices === null) { return; }

    asmtchoices.passedElement.element.addEventListener(
      "addItem",
      function (event) {
        if (event.detail.value === "") {
          setasmtSelected('')
        } else {
          setasmtSelected(event.detail.value)
        }
      }, false);
  }, [asmtchoices])
  useEffect(() => {
    if (lessonchoices === undefined || lessonchoices === null) { return; }

    lessonchoices.passedElement.element.addEventListener(
      "addItem",
      function (event) {
        if (event.detail.value === "") {
          setlessonSelected('')
        } else {
          setlessonSelected(event.detail.value)
        }
      }, false);
  }, [lessonchoices])


  useEffect(() => {
    if (subjectchoices === undefined || subjectchoices === null) { return; }
    fetchCoursedetails()
    subjectchoices.passedElement.element.addEventListener(
      "addItem",
      function (event) {
        if (event.detail.value === "") {
          setsubjectSelected('')
        } else {
          setsubjectSelected(event.detail.value)
        }
      }, false);
  }, [subjectchoices])


  useEffect(() => {
    if (subjectSelected.length > 0) {
      getSubjectLessons(subjectSelected)
    }
  }, [subjectSelected])
  useEffect(() => {
    if (lessonSelected.length > 0) {
      getLessonAssessments(lessonSelected)
    }
  }, [lessonSelected])


  useEffect(() => {
    if (subjectList.length == 0) { return; }
    var subjectArray = [
      { value: "", label: "Select Subject", placeholder: true, disabled: true, selected: true },]
    subjectList.map((subject) => {
      subjectArray.push({
        value: subject[fbc.SUBJECT_UID],
        customProperties: subject,
        label: subject[fbc.SUBJECT_NAME]
      })
    })
    subjectchoices.clearChoices().setChoices(subjectArray)
    asmtchoices.clearChoices()
    setsubjectSelected('')
    setasmtSelected('')
    setlessonSelected('')
  }, [subjectList])


  useEffect(() => {
    if (lessons.length == 0) { return; }
    var lessonArray = [
      { value: "", label: "Select Lesson", placeholder: true, disabled: true, selected: true },]
    lessons.map((lesson) => {
      lessonArray.push({
        value: lesson[fbc.LESSON_UID],
        customProperties: lesson,
        label: lesson[fbc.LESSON_NAME]
      })
    })
    lessonchoices.clearChoices().setChoices(lessonArray)
    asmtchoices.clearChoices()

    setasmtSelected('')
    setlessonSelected('')
  }, [lessons])
  useEffect(() => {
    if (assesments.length == 0) { return; }
    var asmtArray = [
      { value: "", label: "Select Assessment", placeholder: true, disabled: true, selected: true },]
    assesments.map((asmt) => {
      asmtArray.push({
        value: asmt[fbc.ASMT_UID],
        customProperties: asmt,
        label: asmt[fbc.ASMT_TITLE]
      })
    })
    asmtchoices.clearChoices().setChoices(asmtArray)

    setasmtSelected('')

  }, [assesments])


  useEffect(() => {
    setsubjectchoices(
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
        choices: [],
      }))
    setlessonchoices(
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
        choices: [],
      }))
    setasmtchoices(
      new Choices($("#asmtselect")[0], {
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
        choices: [],
      }))
    initModal();
  }, []);

  async function getLessonAssessments(lessonuid) {

    console.log(lessonuid);
    var allAsmts = [];
    utility.showloading();
    try {
      const asmtReF = collection(db, fbc.ASMT_COLLECTION);
      const q = query(asmtReF,
        where(fbc.ASMT_LESSON + ".uid", '==', lessonuid),
        where(fbc.ASMT_STATUS, '==', true),
        where(fbc.ASMT_ISPRACTICE, '==', true),
        orderBy(fbc.ASMT_CODE));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allAsmts.push(doc.data());
      });
      setassesments(allAsmts)
    } catch (error) {
      console.log(error);
      errorCallback(error);
    }
    utility.hideloading()

  }
  async function getSubjectLessons(uid) {
    const lessonRef = collection(db, fbc.LESSON_COLLECTION);
    const q = query(lessonRef,
      where(fbc.LESSON_SUBJECT + `.uid`, "==", uid),
      where(fbc.LESSON_STATUS, "==", true)
    );
    var lessons = []
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      lessons.push(doc.data())
    });
    setlessons(lessons)
  }
  async function fetchCoursedetails() {
    if (utility.get_keyvalue(USER_COURSES).length === 0) {
      window.history.replaceState(null, null, '/student/select-course');
      window.location = '/student/select-course';
      return
    }

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

  function startWorksheet() {
    if (asmtSelected.length == 0) {
      showsnackbar('error', 'Please Select Assessment');
      return;
    }
    window.open(
      window.location.origin + '/student/assessment?id=' + asmtSelected,
      '_blank'
    );

  }



  function initModal() {
    var element;
    var submitButton;
    var cancelButton;
    var closeButton;
    var form;
    var modal;

    element = document.querySelector('#modal_worksheet');
    modal = new bootstrap.Modal(element);
    setselectWorksheetModal(modal);
    submitButton = document.querySelector('#modal_worksheet_submit');
    cancelButton = document.querySelector('#modal_worksheet_cancel');
    closeButton = document.querySelector('#modal_worksheet_close');

    closeButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });
    cancelButton.addEventListener('click', function (e) {
      e.preventDefault();
      modal.hide();
    });
  }


  return (
    <div
      className="modal fade"
      id="modal_worksheet"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable h-75">
        <div className="modal-content h-75">
          <div className="modal-header p-5" id="modal_worksheet_header">
            <h4 className="fw-bold">Start Worksheet</h4>

            <button
              id="modal_worksheet_close"
              className="btn-icon btn btn-sm btn-active-light-primary rounded-circle"
            >
              <span className="ri-close-line fs-1"></span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="fv-row mb-7 col-md-12">
                <label className="required fs-6 fw-semibold mb-2">
                  Select Subject
                </label>

                <select id="subjectselect"></select>
              </div>
              <div className="fv-row mb-7 col-md-12">
                <label className="required fs-6 fw-semibold mb-2">
                  Select Lesson
                </label>

                <select id="lessonselect"></select>
              </div>
              <div className="fv-row mb-7 col-md-12">
                <label className="required fs-6 fw-semibold mb-2">
                  Select Assessment
                </label>

                <select id="asmtselect"></select>
              </div>
            </div>

          </div>

          <div className="modal-footer flex-end p-3">
            <button
              type="reset"
              id="modal_worksheet_cancel"
              className="btn py-2 btn-light me-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="modal_worksheet_submit"
              onClick={(e) => startWorksheet()}
              className="btn py-2 btn-primary"
            >
              <span>Start</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectWorksheet;
