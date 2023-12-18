// components/SubAdminList.js
import { collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// components/Employees.js
import StatsCard from '@/components/masters/StatsCard';
import { orderBy } from 'firebase/firestore';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';

const Employees = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectUser, setSelectUser] = useState(null);
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

  const getAllEmployees = async () => {
    utility.showloading();
    try {
      const EmployeeReF = collection(db, fbc.EMPLOYEE_COLLECTION);
      const q = query(EmployeeReF, orderBy(fbc.EMPLOYEE_NAME));
      const querySnapshot = await getDocs(q);
      const allEmployees = [];

      querySnapshot.forEach((doc) => {
        allEmployees.push(doc.data());
      });

      setEmployeeDocs(allEmployees);
    } catch (error) {
      console.log('Unsuccessful returned error', error);
      errorCallback(error);
    } finally {
      utility.hideloading();
    }
  };

  const filterEmployeeList = () => {
    if (selectUser === null) {
      return allEmployeeDocs; // Show all data if no category is selected
    }

    // Filter data based on the selected category (sub-admin, employee, teacher, student)
    return allEmployeeDocs.filter((employeeDoc) => {
      // Adjust the condition based on your data structure
      return employeeDoc[fbc.EMPLOYEE_MODULES] === selectUser;
    });
  };

  useEffect(() => {
    getAllEmployees();
  }, [selectUser]);

  useEffect(() => {
    // Render your employee list based on the filtered data
    const filteredEmployees = filterEmployeeList();
    renderEmployeeList(filteredEmployees);
  }, [allEmployeeDocs, selectUser]);

  const renderEmployeeList = (filteredEmployees) => {
    // Update this part to render the employee list based on your UI requirements
    console.log('Filtered Employees:', filteredEmployees);
    // Example: You can map through the filteredEmployees and render them
    // filteredEmployees.map((employee) => (
    //   <div key={employee.id}>
    //     {/* Render employee information here */}
    //   </div>
    // ));
  };

  const handleReadyScript = () => {
    console.log('SCRIPT Ready');
    utility.hideloading();
  };

  const handleLoadScript = () => {
    console.log('SCRIPT LOADED');
  };

  const handleLoadErrorScript = (e) => {
    console.log('SCRIPT Error', e);
    showsnackbar('error', 'Failed To Load Script');
  };

  return (
    <div style={{ backgroundColor: '#E6E6FA' }}>
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
              className="app-main flex-row flex-row-fluid py-2 px-4 "
              id="kt_app_main"
            >
              {/* Your existing JSX code here */}
              <StatsCard setSelectUser={setSelectUser} />
              {/* Additional JSX code, if any */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
