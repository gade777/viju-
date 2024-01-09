import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../functions/index'; // Update with the correct path

const RequestFetchEmployeeData = async () => {
  const fetchEmployeeData = httpsCallable(functions, 'fetchEmployeeData');
  console.log('statscard',fetchEmployeeData)

  try {
    const result = await fetchEmployeeData();
    return result.data;
  } catch (error) {
    console.error('ERROR:', error);
    return {
      status: false,
      data: [],
      message: error.message + ', ' + error.details,
    };
  }
};

const StatsCard = () => {
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const result = await RequestFetchEmployeeData();
        
        if (result.status) {
          setEmployeeCount(result.data.length);
        } else {
          console.error('Error fetching employee data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, []); // Empty dependency array means this effect will run once when the component mounts

  return (
    <div className="container">
      <div className="row justify-content-around">
        <div className="col-lg-3 col-md-6 col-sm-12 mb-3 text-center">
          <div className="card bg-info text-white shadow p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <i className="fa fa-users"></i>
              <span className="count-numbers" style={{ fontSize: '3em' }}>
                {employeeCount}
              </span>
              <span className="count-name" style={{ fontSize: '1.5em' }}>
                Employees
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
