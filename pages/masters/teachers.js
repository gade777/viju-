import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import AddorUpdateTeacher from '../../components/masters/add-teacher';
import Sidebar from '../../components/sidebar';
import { db } from '../../firebase/firebaseconfig';
import * as fbc from '../../firebase/firebaseConstants';
import * as utility from '../../libraries/utility';
const Teachers = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectTeacher, setselectTeacher] = useState(null);
  const [addTeacherModal, setaddTeacherModal] = useState(null);
  const [allTeacherDocs, setTeacherDocs] = useState([]);
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
    if (selectTeacher == null) {
      return;
    }
    addTeacherModal.show();
  }, [selectTeacher]);
  function addNewTeacher() {
    setselectTeacher(() => {
      return null;
    });
    addTeacherModal.show();
  }
  function modifyTeacher(teacher_uid) {
    setselectTeacher((user) => {
      var empDoc = null;
      allTeacherDocs.map((teacherDoc, index) => {
        if (teacherDoc[fbc.TEACHER_UID] === teacher_uid) {
          empDoc = teacherDoc;
        }
      });
      console.log({ teacher_uid, empDoc });
      return empDoc;
    });
    // addTeacherModal.show();
  }

  async function getAllTeachers() {
    utility.showloading();
    try {
      const TeacherReF = collection(db, fbc.TEACHER_COLLECTION);
      var allTeachers = [];
      const q = query(TeacherReF, orderBy(fbc.TEACHER_NAME));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allTeachers.push(doc.data());
      });
      setTeacherDocs(allTeachers);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    utility.hideloading();
  }

  useEffect(() => {
    if (allTeacherDocs.length > 0) {
      allTeacherDocs.map((teacherDoc, index) => {
        var active = `<span class="badge p-3 fs-7 badge-light-success">
                            Active
                          </span>`;
        var inactive = `<span class="badge p-3 fs-7 badge-light-danger">
                            In-Active
                          </span>`;

        var rowitem = `<tr>
                        <td class="text-gray-800 mb-1">${index + 1}.</td>
                        <td class="text-gray-800 mb-1">${teacherDoc[fbc.TEACHER_NAME]
          }</td>
                        <td class="text-gray-800 mb-1">${teacherDoc[fbc.TEACHER_EMAILADDRESS]
          }</td>
                        <td class="text-gray-800 mb-1">${teacherDoc[fbc.TEACHER_PHONENUMBER]
          }</td>

                        <td>
                          ${teacherDoc[fbc.TEACHER_STATUS] ? active : inactive
          }
                        </td>

                        <td class="text-end">
                          <button id="${teacherDoc[fbc.TEACHER_UID]
          }" class="btn btn-sm btn-light btn-active-light-primary m-1">
                            MODIFY
                          </button>
                        </td>
                      </tr>`;

        $('#teacherstablebody').append(rowitem);
        $('#' + teacherDoc[fbc.TEACHER_UID]).on('click', function () {
          modifyTeacher(this.id);
        });
      });

      var datatable = $('#teacherstable').DataTable({
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
  }, [allTeacherDocs]);

  useEffect(() => { }, []);
  const handleReadyScript = () => {
    console.log('SCRIPT Ready');
    getAllTeachers();
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
          <Header title={'Teachers'} />

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
                        onClick={(e) => addNewTeacher()}
                      // data-bs-target="#modal_adduser"
                      >
                        Add Teacher
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-body p-4" id="contentdiv">
                  <table
                    className="table align-middle table-row-dashed fs-6 gy-5"
                    id="teacherstable"
                  >
                    <thead>
                      <tr className="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                        <th className="py-0 px-3">#</th>
                        <th className="py-0 px-3 min-w-125px">Name</th>
                        <th className="py-0 px-3 min-w-125px">Email</th>
                        <th className="py-0 px-3 min-w-125px">Phone</th>
                        <th className="py-0 px-3 min-w-125px">Status</th>
                        <th className="py-0 px-3 text-end min-w-70px">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody
                      id="teacherstablebody"
                      className="fw-semibold text-gray-600"
                    ></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddorUpdateTeacher
        setselectTeacher={setselectTeacher}
        selectTeacher={selectTeacher}
        setTeacherModal={setaddTeacherModal}
      />
    </div>
  );
};

export default Teachers;
export async function getStaticProps() {
  return {
    props: { module: 'USERMASTER', onlyAdminAccess: false },
  };
}
