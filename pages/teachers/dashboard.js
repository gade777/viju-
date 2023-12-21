import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import Header from '../../components/header';
import AddorUpdateEmployee from '../../components/masters/add-employee';
import Sidebar from '../../components/sidebar';
import { db } from '../../firebase/firebaseconfig';
import * as fbc from '../../firebase/firebaseConstants';
import * as utility from '../../libraries/utility';
const Employees = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectUser, setselectUser] = useState(null);
  const [addUserModal, setaddUserModal] = useState(null);
  const [allEmployeeDocs, setEmployeeDocs] = useState([]);
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
    if (selectUser == null) {
      return;
    }
    addUserModal.show();
  }, [selectUser]);
  function addNewUser() {
    setselectUser(() => {
      return null;
    });
    addUserModal.show();
  }
  function modifyEmployee(employee_uid) {
    setselectUser((user) => {
      var empDoc = null;
      allEmployeeDocs.map((employeeDoc, index) => {
        if (employeeDoc[fbc.EMPLOYEE_UID] === employee_uid) {
          empDoc = employeeDoc;
        }
      });
      console.log({ employee_uid, empDoc });
      return empDoc;
    });
    // addUserModal.show();
  }

  async function getAllEmployees() {
    utility.showloading();
    try {
      const EmployeeReF = collection(db, fbc.EMPLOYEE_COLLECTION);
      var allEmployees = [];
      const q = query(EmployeeReF, orderBy(fbc.EMPLOYEE_NAME));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allEmployees.push(doc.data());
      });
      setEmployeeDocs(allEmployees);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    }

    utility.hideloading();
  }

  useEffect(() => {
    if (allEmployeeDocs.length > 0) {
      allEmployeeDocs.map((employeeDoc, index) => {
        var active = `<span class="badge p-3 fs-7 badge-light-success">
                            Active
                          </span>`;
        var inactive = `<span class="badge p-3 fs-7 badge-light-danger">
                            In-Active
                          </span>`;

        var rowitem = `<tr>
                        <td class="text-gray-800 mb-1">${index + 1}.</td>
                        <td class="text-gray-800 mb-1">${employeeDoc[fbc.EMPLOYEE_NAME]
          }</td>
                        <td class="text-gray-800 mb-1">${employeeDoc[fbc.EMPLOYEE_EMAILADDRESS]
          }</td>
                        <td class="text-gray-800 mb-1">${employeeDoc[fbc.EMPLOYEE_CODE]
          }</td>

                        <td>
                          ${employeeDoc[fbc.EMPLOYEE_STATUS] ? active : inactive
          }
                        </td>

                        <td class="text-end">
                          <button id="${employeeDoc[fbc.EMPLOYEE_UID]
          }" class="btn btn-sm btn-light btn-active-light-primary m-1">
                            MODIFY
                          </button>
                        </td>
                      </tr>`;

        $('#employeestablebody').append(rowitem);
        $('#' + employeeDoc[fbc.EMPLOYEE_UID]).on('click', function () {
          modifyEmployee(this.id);
        });
      });

      var datatable = $('#employeestable').DataTable({
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
  }, [allEmployeeDocs]);

  useEffect(() => { }, []);
  const handleReadyScript = () => {
    console.log('SCRIPT Ready');
    utility.hideloading()
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
          <Header title={'Dashboard'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-4"
              id="kt_app_main"
            >

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
    props: { module: 'TEACHERDASHBOARD', onlyAdminAccess: false },
  };
}
