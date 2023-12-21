// components/StatsCard.js
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { app } from '../../firebase/firebaseconfig'; // Update with the correct path

const StatsCard = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [registeredEmployeeCount, setRegisteredEmployeeCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const firestore = getFirestore(app);

        // Fetch employee data
        const employeesCollection = collection(firestore, 'employees');
        const employeesSnapshot = await getDocs(employeesCollection);
        const employeesData = employeesSnapshot.docs.map((doc) => doc.data());

        setEmployeeData(employeesData);

        // Set registered employee count
        setRegisteredEmployeeCount(employeesData.length);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <div className="row justify-content-around">
        <div className="col-lg-3 col-md-6 col-sm-12 mb-3 text-center">
          <div className="card bg-info text-white shadow p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <i className="fa fa-code-fork"></i>
              <span className="count-numbers" style={{ fontSize: '2em' }}>
                {registeredEmployeeCount}
              </span>
              <span className="count-name" style={{ fontSize: '1.5em' }}>
                Registered Employees
              </span>
            </div>
          </div>
        </div>

        {/* Dummy data cards */}
        {employeeData.map((employee, index) => (
          <div
            key={index}
            className={`col-lg-3 col-md-6 col-sm-12 mb-3 text-center`}
          >
            <div
              className={`card bg-info text-white shadow p-3 mb-5 bg-white rounded`}
            >
              <div className="card-body">
                <i className="fa fa-code-fork"></i>
                <span className="count-numbers" style={{ fontSize: '2em' }}>
                  {employee.employeeId}
                </span>
                <span className="count-name" style={{ fontSize: '1.5em' }}>
                  {employee.employeeName}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;
