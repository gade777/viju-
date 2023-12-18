import { arrayUnion, collection, deleteField, doc, getDoc, getDocs, orderBy, query, where, writeBatch } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { USER_FULLNAME, USER_ID, USER_ISADMIN } from '../../constants/appconstants';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';
import AddorUpdateContent from './add-update-content';
import AddorUpdateLesson from './add-update-lesson';
import AddorUpdateVideo from './add-update-video';
const SubjectList = ({ courseuid, subjectuid }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [subjectDocs, setSubjectDocs] = useState([]);
  const [selectLesson, setselectLesson] = useState(null);
  const [addNewLesson, setaddNewLesson] = useState(null);
  const [addLessonModal, setaddLessonModal] = useState(null);
  const [selectContent, setselectContent] = useState(null);
  const [selectVideo, setselectVideo] = useState(null);
  const [addNewVideo, setaddNewVideo] = useState(null);
  const [addNewContent, setaddNewContent] = useState(null);
  const [addVideoModal, setaddVideoModal] = useState(null);
  const [addContentModal, setaddContentModal] = useState(null);
  const [lessonDocs, setlessonDocs] = useState({});
  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  };

  useEffect(() => {
    if (selectLesson == null) {
      return;
    }
    addLessonModal.show();
  }, [selectLesson]);


  useEffect(() => {
    if (addNewLesson == null) {
      return;
    }
    addLessonModal.show();
  }, [addNewLesson]);

  useEffect(() => {
    if (addNewContent == null) {
      return;
    }
    addContentModal.show();
  }, [addNewContent]);

  useEffect(() => {
    if (addNewVideo == null) {
      return;
    }
    addVideoModal.show();
  }, [addNewVideo]);
  function addNewLessonClick(id) {

    subjectDocs.map(subject => {
      if (subject[fbc.SUBJECT_UID] === id) {
        setaddNewLesson(() => {
          return {
            subject: {
              uid: id,
              name: subject[fbc.SUBJECT_NAME],
              code: subject[fbc.SUBJECT_CODE]
            },
            course: subject[fbc.SUBJECT_COURSE]
          }
        });
      }
    })



  }



  const errorCallback = (err) => {
    utility.hideloading();
    showsnackbar('error', err.message);
  };

  useEffect(() => {

    if (courseuid !== null && courseuid?.length > 0) {
      getAllSubjects(courseuid)
    }

  }, [courseuid])


  useEffect(() => {
    console.log("LENTG" + subjectDocs.length);
    if (subjectDocs.length === 0) {
      return
    }
    $("#subjects_accordion").empty()

    subjectDocs.map(subject => {


      var tabbtn = ` <li class="nav-item g-5">
          <button
            class="nav-link btn btn-outline btn-active-light-primary fw-bolder px-4 py-2 me-2 text-uppercase"
            data-bs-toggle="tab"
            id="tabbtn_${subject[fbc.SUBJECT_UID]}"
            href="#tab_${subject[fbc.SUBJECT_UID]}"
          >
             ${subject[fbc.SUBJECT_NAME]}
          </button>
        </li>`

      $("#subjecttabs").append(tabbtn)
      var tabcontent = ` <div
          class="tab-pane fade h-100"
          id="tab_${subject[fbc.SUBJECT_UID]}"
          role="tabpanel"
        >
        

        <div class="card h-100">
        
        <div class="card-header py-3 px-4 d-flex flex-row align-items-center justify-content-between w-100">
        <div class="d-flex flex-row align-items-center">
         <img  src="${subject[fbc.SUBJECT_THUMBNAILURL]}" class="mb-2 bg-white rounded shadow-md   w-50px h-50px"></img>
        <div class="d-flex flex-column align-items-start  ps-4">

        <span class="fs-5 fw-bold">${subject[fbc.SUBJECT_NAME]}</span>
        <span class="fs-7">${utility.padwithzero(subject[fbc.SUBJECT_LESSONSUIDARRAY].length)} Lessons</span>
        </div>
        </div>
         <div class="d-flex justify-content-end w-25">
                      <button
                        id="addlessonbtn_${subject[fbc.SUBJECT_UID]}"
                        type="button"
                        class="btn btn-sm fs-5 py-2 px-3 btn-light-primary w-auto"
                      >
                        Add Lesson
                      </button>
                    </div>
        </div>
         <div class="card-body p-2"
         class="accordion accordion-icon-toggle h-100" id="accordion_${subject[fbc.SUBJECT_UID]}">
        


        </div>
        </div>
        </div>
        <div
        </div>`

      $("#subjectTabContent").append(tabcontent)

      $(`#addlessonbtn_${subject[fbc.SUBJECT_UID]}`).on('click', function () {
        addNewLessonClick(this.id.replaceAll("addlessonbtn_", ""));
      });
      var lessonsArray = []


      Object.keys(subject[fbc.SUBJECT_LESSONS]).map((key, index) => {
        lessonsArray.push(subject[fbc.SUBJECT_LESSONS][key])
      })
      lessonsArray.sort(function (x, y) {
        let a = Number(x.code.split("-")[x.code.split("-").length - 1].replaceAll("L", "")),
          b = Number(y.code.split("-")[y.code.split("-").length - 1].replaceAll("L", ""));
        return a == b ? 0 : a > b ? 1 : -1;
      });
      // console.log(lessonsArray);
      lessonsArray.map((lesson) => {

        var key = lesson.uid

        var item = ` <div class="mb-5">

          <div id="lessondiv_${key}" class="accordion-header border-bottom rounded bg-light-primary  align-items-center  p-3 d-flex collapsed" data-bs-toggle="collapse" data-bs-target="#${key}_lesson">
          
            <div class="d-flex flex-row align-items-center justify-content-between w-100">
                <div class="d-flex flex-column">

                <div class="d-flex flex-row align-items-center">
                            <img  src="${lesson.thumbnail_url}" class=" bg-white rounded shadow-md   w-30px h-30px"></img>
                            <div class="d-flex flex-column align-items-start ps-4">
                              <h3 class="fs-4 fw-bolder text-capitalize  mb-0">${lesson.name}</h3>
                            </div>

                </div>

                </div>
                <div class="d-flex justify-content-end w-25">
                 <button
                        id="editlesson_${lesson.uid}"
                        type="button"
                        class="btn btn-sm text-xs py-2 px-3 btn-light-primary btn-outline ms-2 w-auto"
                      >
                        Modify Lesson
                      </button>
                      <button
                        id="addcontent_${lesson.uid}"
                        type="button"
                        class="btn btn-sm text-xs py-2 px-3 btn-light-primary btn-outline ms-2 w-auto"
                      >
                        Add Content
                      </button>
                    <button
                        id="addvideo_${lesson.uid}"
                        type="button"
                        class="btn btn-sm text-xs py-2 px-3 btn-light-primary btn-outline ms-2 w-auto"
                      >
                        Add Video
                      </button>
                      <button
                        id="addassements_${lesson.uid}"
                        type="button"
                        class="btn btn-sm text-xs py-2 px-3 btn-light-primary btn-outline ms-2 w-auto"
                      >
                        Add Assements
                      </button>
                    </div>
            </div>

          </div>
          <div id="${key}_lesson" class="collapse bg-light px-4 py-2 mt-2 rounded" data-bs-parent="#accordion_${subject[fbc.SUBJECT_UID]}">
          <ul
          id="lessontabs_${key}"
          class="nav nav-tabs border-0 flex-nowrap text-nowrap  my-2"
          >
            <li class="nav-item g-5">
                      <button
                        class="nav-link text-xs btn btn-outline btn-active-light-primary px-4 py-1 me-2"
                        data-bs-toggle="tab"
                        id="content_tabbtn_${key}"
                        href="#content_${key}"
                      >
                        Content
                      </button>
            </li>
            <li class="nav-item g-5">
                      <button
                        class="nav-link text-xs btn btn-outline btn-active-light-primary px-4 py-1 me-2"
                        data-bs-toggle="tab"
                        id="assesment_tabbtn_${key}"
                        href="#assesment_${key}"
                      >
                        Assesment
                      </button>
            </li>
          </ul>
          <hr class="text-muted"/>
          <div class="tab-content h-100" id="lessontabContent_${key}">

              <div
              class="tab-pane fade h-100 draggable-zone_${key}"
              id="content_${key}"
              role="tabpanel"
            >
           




            </div>
              <div
              class="tab-pane fade h-100"
              id="assesment_${key}"
              role="tabpanel"
            >
              

            </div>

          </div>
          </div>
        </div>`
        $("#accordion_" + subject[fbc.SUBJECT_UID]).append(item)


        $(`#content_tabbtn_${key}`).on('click', function () {
          getLessonContent(this.id.replaceAll("content_tabbtn_", ""));
        });
        $(`#assesment_tabbtn_${key}`).on('click', function () {
          getLessonAssessments(this.id.replaceAll("assesment_tabbtn_", ""));
        });


        $(`#addvideo_${lesson.uid}`).on('click', function (e) {
          e.preventDefault();
          addNewVideoClick(this.id.replaceAll("addvideo_", ""));
        });

        $(`#addcontent_${lesson.uid}`).on('click', function (e) {
          e.preventDefault();
          addNewContentClick(this.id.replaceAll("addcontent_", ""));
        });
        $(`#addassements_${lesson.uid}`).on('click', function (e) {
          e.preventDefault();
          console.log(this.id);
          addNewAssessment(this.id.replaceAll("addassements_", ""));
          return true;
        });

        $(`#editlesson_${lesson.uid}`).on('click', async function (e) {
          e.preventDefault();
          var lesson = await getLesson(this.id.replaceAll("editlesson_", ""))
          console.log(lesson);
          addLessonModal.show();
          setselectLesson(() => {
            return lesson
          });
        });


      })


      if (subject[fbc.SUBJECT_UID] === subjectuid) {
        $("#tabbtn_" + subjectuid).click()
      }
    })

  }, [subjectDocs])

  async function addNewAssessment(id) {
    window.open(
      window.location.origin + '/masters/edit-assessment?lesson=' + id,
      '_blank'
    );
  }

  async function addNewContentClick(id) {
    var lessonData = await getLesson(id)
    setaddNewContent(() => {
      return {
        lesson: {
          uid: id,
          name: lessonData[fbc.LESSON_NAME],
          code: lessonData[fbc.LESSON_CODE]
        },
        subject: lessonData[fbc.LESSON_SUBJECT],
        course: lessonData[fbc.LESSON_COURSE]
      }
    });
  }

  async function addNewVideoClick(id) {
    var lessonData = await getLesson(id)
    setaddNewVideo(() => {
      return {
        lesson: {
          uid: id,
          name: lessonData[fbc.LESSON_NAME],
          code: lessonData[fbc.LESSON_CODE]
        },
        subject: lessonData[fbc.LESSON_SUBJECT],
        course: lessonData[fbc.LESSON_COURSE]
      }
    });
  }


  async function getLesson(lessonuid, isforce = false) {
    var lessonData = {}
    if (lessonDocs[lessonuid] !== undefined && !isforce) {
      lessonData = lessonDocs[lessonuid]
    } else {
      utility.showloading()
      const docRef = doc(db, fbc.LESSON_COLLECTION, lessonuid);
      const docSnap = await getDoc(docRef);
      utility.hideloading()
      if (docSnap.exists()) {
        setlessonDocs((olddocs) => {
          var newData = JSON.parse(JSON.stringify(olddocs))
          newData[lessonuid] = docSnap.data();
          return newData;
        })
        lessonData = docSnap.data();
      } else {
        errorCallback({ message: "No Details Available" });
      }
    }
    return lessonData;
  }

  async function getLessonContent(lessonuid) {

    var lessonData = await getLesson(lessonuid)

    $(`#content_${lessonuid}`).empty()


    if (Object.keys(lessonData[fbc.LESSON_CONTENT]).length === 0) {
      var item = ` <div class="d-flex flex-row bg-white border rounded py-2 px-5 w-100 justify-content-between mb-2 ">

          <div class="d-flex flex-column">

            <span class="fs-5 fw-bold">No Content Added</span>
            <span class="text-xs text-muted">Please Add Contents</span>

          </div>
        </div>`

      $(`#content_${lessonuid}`).append(item)
      return;
    }

    var contentArray = []

    Object.keys(lessonData[fbc.LESSON_CONTENT]).map(key => {
      contentArray.push(lessonData[fbc.LESSON_CONTENT][key])
    })

    contentArray.sort(function (x, y) {
      let a = x[fbc.CONTENT_FILE].filename,
        b = y[fbc.CONTENT_FILE].filename;
      return a == b ? 0 : a > b ? 1 : -1;
    });
    contentArray.map(content => {
      var item = ` <div id="contentdiv_${content[fbc.CONTENT_UID]}" class=" draggable_${lessonuid} d-flex flex-row bg-white border rounded py-2 px-5 justify-content-between mb-2">
      
      <div class="d-flex flex-row align-items-center w-75"> 
      <span class="fs-3 text-primary border-secondary border-end pe-3 fw-bold my-auto">

       ${(() => {
          switch (content[fbc.CONTENT_FILE].mime) {
            case "application/pdf":
              return (`<i class="ri-article-fill"></i>`);
            case "image/jpeg":
              return (`<i class="ri-image-2-fill"></i>`);
            case "video/url":
              return (`<i class="ri-play-circle-fill"></i>`);
            default:
              return null;
          }
        })()}
                                            </span >
          <div class="d-flex flex-column ps-4">

            <span class="fs-6 fw-bold mb-1">${content[fbc.CONTENT_HEADING]}</span>
            <span class="text-xs text-muted text-wrap">${content[fbc.CONTENT_DESCRIPTION]}</span>

          </div>
</div>

          <div class='d-flex flex-row align-items-center gap-2 py-2'>
         
            <button
             data-filename="${content[fbc.CONTENT_FILE].filename}"
              id="viewcontent_${content[fbc.CONTENT_UID]}_${lessonuid}" 
            
            class="btn h-30px text-xs px-2 py-1 btn-sm btn-light-primary">
              <i class="ri-eye-fill fs-5"></i>
              view
            </button>
            <button
            data-filename="${content[fbc.CONTENT_FILE].filename}"
            id="deletecontent_${content[fbc.CONTENT_UID]}_${lessonuid}" class="btn  h-30px text-xs px-2 py-1 btn-sm btn-light-danger">
              <i class="ri-delete-bin-6-fill fs-5"></i>
              Delete
            </button>
            
          </div>

        </div>`

      $(`#content_${lessonuid}`).append(item)

      $(`#viewcontent_${content[fbc.CONTENT_UID]}_${lessonuid}`).on('click', function (e) {
        window.location = '/student/content?view=' + this.id.split("_")[1]
      });

      $(`#deletecontent_${content[fbc.CONTENT_UID]}_${lessonuid}`).on('click', function (e) {
        var filename = $("#" + this.id).data("filename")
        utility.info_alert(
          `Delete File : ${filename} ?`,
          'Are you sure you want to continue.',
          'Delete',
          'CANCEL',
          () => {
            var data = this.id.replaceAll("deletecontent_", "").split("_")
            deleteContent(data[1], data[0]);
          },
          null
        );



      });
    })


    var containers = document.querySelectorAll(".draggable-zone_" + lessonuid);

    if (containers.length === 0) {
      console.log("NO CONTAINERS");
      return false;
    }

    var droppable = new Sortable.default(containers, {
      draggable: ".draggable_" + lessonuid,
      dropzone: ".draggable-zone_" + lessonuid,
      handle: `.draggable-handle_${lessonuid}`,
      mirror: {
        //appendTo: selector,
        appendTo: "body",
        constrainDimensions: true
      }
    });

    droppable.on('sortable:sorted', (e) => console.log('sortable:sorted', e));


  }

  async function getLessonAssessments(lessonuid) {


    var allAsmts = [];
    utility.showloading();
    try {
      const asmtReF = collection(db, fbc.ASMT_COLLECTION);
      const q = query(asmtReF,
        where(fbc.ASMT_LESSON + ".uid", '==', lessonuid),
        where(fbc.ASMT_STATUS, '==', true),
        orderBy(fbc.ASMT_CODE));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allAsmts.push(doc.data());
      });
    } catch (error) {
      console.log(error);
      errorCallback(error);
    }
    utility.hideloading()


    $(`#assesment_${lessonuid}`).empty()
    console.log("allAsmts : " + allAsmts.length);

    if (allAsmts.length === 0) {
      var item = ` <div class="d-flex flex-row bg-white border rounded py-2 px-5 w-100 justify-content-between mb-2 ">

          <div class="d-flex flex-column">

            <span class="fs-5 fw-bold">No Assessment Added</span>
            <span class="text-xs text-muted">Please Add Assessments</span>

          </div>
        </div>`

      $(`#assesment_${lessonuid}`).append(item)
      return;
    }

    allAsmts.map(asmt => {
      var item = ` <div id="asmtdiv_${asmt[fbc.ASMT_UID]}" class="d-flex flex-row bg-white border rounded py-2 px-5 justify-content-between mb-2">
      
      <div class="d-flex flex-row align-items-center w-75"> 
      
          <div class="d-flex flex-column ps-4">

            <span class="text-xs text-muted mb-1">${asmt[fbc.ASMT_CODE]} | ${asmt[fbc.ASMT_DURATION]}mins | ${asmt[fbc.ASMT_TOTAL]}Marks</span>
            <span class="fs-6 fw-bold text-wrap">${asmt[fbc.ASMT_TITLE]}</span>

          </div>
      </div>

          <div class='d-flex flex-row align-items-center gap-2 py-2'>
         
           
            <button
            id="viewasmt_${asmt[fbc.ASMT_UID]}_${lessonuid}" class="btn  h-30px text-xs px-2 py-1 btn-sm btn-light-primary">
              <i class="ri-eye-fill fs-5"></i>
              view
            </button>
            
          </div>

        </div>`

      $(`#assesment_${lessonuid}`).append(item)

      $(`#viewasmt_${asmt[fbc.ASMT_UID]}_${lessonuid}`).on('click', function (e) {
        window.open(
          window.location.origin + '/masters/edit-assessment?lesson=' + this.id.split("_")[2] + '&id=' + this.id.split("_")[1],
          '_blank'
        );
      });
    })



  }


  async function deleteContent(lessonuid, contentuid) {
    var lessonData = await getLesson(lessonuid)
    console.log({ lessonData, lessonuid, contentuid });
    utility.showloading()
    const batch = writeBatch(db)
    const contentRef = doc(db, fbc.CONTENT_COLLECTION, contentuid)
    const lessonRef = doc(db, fbc.LESSON_COLLECTION, lessonuid)
    batch.set(contentRef, {
      [fbc.CONTENT_STATUS]: false,
      [fbc.CONTENT_LOGS]: arrayUnion({
        message: 'Content Deleted ',
        name: utility.get_keyvalue(USER_FULLNAME),
        uid: utility.get_keyvalue(USER_ID),
        date: utility.getDateandTime(),
        timestamp: utility.getTimestamp(),
      }),

    }, { merge: true })
    batch.set(lessonRef, {
      [fbc.LESSON_DELETEDCONTENT]: {
        [contentuid]: lessonData[fbc.LESSON_CONTENT][contentuid]
      },
      [fbc.LESSON_CONTENT]: {
        [contentuid]: deleteField()
      }
    }, { merge: true })
    await batch.commit();
    $(`#contentdiv_${contentuid}`).remove()
    lessonData = await getLesson(lessonuid, true)
    utility.hideloading()
  }


  async function getAllSubjects(uid) {

    if (uid.length === 0) { return }
    console.log({ uid });
    utility.showloading();
    try {
      const SubjectReF = collection(db, fbc.SUBJECT_COLLECTION);
      var allSubjects = [];
      var params = [
        where(`${fbc.SUBJECT_COURSE}.uid`, "==", uid)
      ];
      if (!utility.get_keyvalue(USER_ISADMIN)) {
        params.push(where(fbc.SUBJECT_ACCESSUSERUIDARRAY, "array-contains", utility.get_keyvalue(USER_ID)))
      }
      let q = query(SubjectReF,
        ...params,
        orderBy(fbc.SUBJECT_NAME));
      const querySnapshot = await getDocs(q);
      console.log("size L " + querySnapshot.size);
      querySnapshot.forEach((doc) => {
        allSubjects.push(doc.data());
      });
      setSubjectDocs(allSubjects);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    utility.hideloading();
  }

  return (
    <>

      <ul
        id="subjecttabs"
        className="nav nav-tabs border-0 flex-nowrap text-nowrap  my-2"
      >


      </ul>

      <div className="tab-content h-100" id="subjectTabContent">

      </div>

      <AddorUpdateLesson addNewLessonDetails={addNewLesson}
        selectedLesson={selectLesson}
        setLessonModal={setaddLessonModal} />

      <AddorUpdateContent addNewContentDetails={addNewContent}
        selectedContent={selectContent}
        setContentModal={setaddContentModal} />

      <AddorUpdateVideo addNewVideoDetails={addNewVideo}
        selectedVideo={selectVideo}
        setVideoModal={setaddVideoModal} />
    </>
  );
};

export default SubjectList;
