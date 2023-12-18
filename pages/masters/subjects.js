import { USER_ID, USER_ISADMIN } from '@/constants/appconstants';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import AddorUpdateSubject from '../../components/masters/add-update-subject';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';
const Subjects = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectSubject, setselectSubject] = useState(null);
  const [addSubjectModal, setaddSubjectModal] = useState(null);
  const [allSubjectDocs, setSubjectDocs] = useState([]);
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
    if (selectSubject == null) {
      return;
    }
    addSubjectModal.show();
  }, [selectSubject]);
  function addNewSubject() {
    setselectSubject(() => {
      return null;
    });
    addSubjectModal.show();
  }
  function viewSubject(subject_uid) {

    var subDoc = null;
    allSubjectDocs.map((subjectDoc, index) => {
      if (subjectDoc[fbc.SUBJECT_UID] === subject_uid) {
        subDoc = subjectDoc;
      }
    });

    window.open(
      window.location.origin + '/masters/course-details?view=' + subDoc[fbc.SUBJECT_COURSE].uid + '&subject=' + subject_uid,
      '_blank'
    );
  }
  function modifySubject(subject_uid) {
    setselectSubject((user) => {
      var subDoc = null;
      allSubjectDocs.map((subjectDoc, index) => {
        if (subjectDoc[fbc.SUBJECT_UID] === subject_uid) {
          subDoc = subjectDoc;
        }
      });
      console.log({ subject_uid, subDoc });
      return subDoc;
    });
    // addSubjectModal.show();
  }

  async function getAllSubjects() {
    utility.showloading();
    try {
      const SubjectReF = collection(db, fbc.SUBJECT_COLLECTION);
      var allSubjects = [];


      var params = [];
      if (!utility.get_keyvalue(USER_ISADMIN)) {
        params.push(where(fbc.SUBJECT_ACCESSUSERUIDARRAY, "array-contains", utility.get_keyvalue(USER_ID)))
      }
      let q = query(SubjectReF,
        ...params,
        orderBy(fbc.SUBJECT_CODE));

      const querySnapshot = await getDocs(q);
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

  useEffect(() => {
    if (allSubjectDocs.length > 0) {
      allSubjectDocs.map((subjectDoc, index) => {
        var active = `<span class="badge p-3 fs-7 badge-light-success">
                            Active
                          </span>`;
        var inactive = `<span class="badge p-3 fs-7 badge-light-danger">
                            In-Active
                          </span>`;

        var rowitem = `<tr>
                        <td class="text-gray-800 mb-1">${index + 1}.</td>
                        <td class="text-gray-800 mb-1">${subjectDoc[fbc.SUBJECT_COURSE].name
          }</td>
                        <td class="text-gray-800 mb-1">${subjectDoc[fbc.SUBJECT_NAME]
          }</td>
                        <td class="text-gray-800 mb-1">${subjectDoc[fbc.SUBJECT_CODE]
          }</td>

                        <td>
                          ${subjectDoc[fbc.SUBJECT_STATUS] ? active : inactive
          }
                        </td>

                        <td class="text-end">
                          <button id="modify_${subjectDoc[fbc.SUBJECT_UID]
          }" class="btn btn-sm btn-light btn-active-light-primary m-1">
                            MODIFY
                          </button>
                          <button id="view_${subjectDoc[fbc.SUBJECT_UID]
          }" class="btn btn-sm btn-light btn-active-light-primary m-1">
                            VIEW
                          </button>
                        </td>
                      </tr>`;

        $('#Subjectstablebody').append(rowitem);
        $('#modify_' + subjectDoc[fbc.SUBJECT_UID]).on('click', function () {
          modifySubject(this.id.replaceAll("modify_", ""));
        });
        $('#view_' + subjectDoc[fbc.SUBJECT_UID]).on('click', function () {
          viewSubject(this.id.replaceAll("view_", ""));
        });
      });

      var datatable = $('#Subjectstable').DataTable({
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
  }, [allSubjectDocs]);

  useEffect(() => { }, []);
  const handleReadyScript = () => {
    console.log('SCRIPT Ready');
    getAllSubjects();
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
          <Header title={'Subjects'} />

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
                      <button
                        type="button"
                        className="btn btn-sm fs-5 btn-light-primary"
                        // data-bs-toggle="modal"
                        onClick={(e) => addNewSubject()}
                      // data-bs-target="#modal_adduser"
                      >
                        Add Subject
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-body p-4" id="contentdiv">
                  <table
                    className="table align-middle table-row-dashed fs-6 gy-5"
                    id="Subjectstable"
                  >
                    <thead>
                      <tr className="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                        <th className="py-0 px-3">#</th>
                        <th className="py-0 px-3 min-w-125px">Course</th>
                        <th className="py-0 px-3 min-w-125px">Name</th>
                        <th className="py-0 px-3 min-w-125px">Code</th>
                        <th className="py-0 px-3 min-w-125px">Status</th>
                        <th className="py-0 px-3 text-end min-w-70px">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody
                      id="Subjectstablebody"
                      className="fw-semibold text-gray-600"
                    ></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddorUpdateSubject
        setselectSubject={setselectSubject}
        selectSubject={selectSubject}
        setSubjectModal={setaddSubjectModal}
      />
    </div>
  );
};

export default Subjects;
export async function getStaticProps() {
  return {
    props: { module: 'COURSEMASTER', onlyAdminAccess: false },
  };
}
