import {
  faDownload,
  faEdit,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

// Import the necessary controllers from Chart.js
import 'chart.js/auto';
const PopupMessage = ({ message, onClose }) => (
  <div className="popup-message">
    <p>{message}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

const UserList = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      position: 'Teacher',
      username: 'Tejas Gade',
      email: 'john.doe@example.com',
      active: true,
    },
    {
      id: 2,
      position: 'Student',
      username: 'Amol ',
      email: 'jane.doe@example.com',
      active: true,
    },
    {
      id: 3,
      position: 'Sub-Admin',
      username: 'Sarthak ',
      email: 'admin.doe@example.com',
      active: false,
    },
    {
      id: 4,
      position: 'Teacher',
      username: 'Tejas Gade',
      email: 'john.doe@example.com',
      active: true,
    },
    {
      id: 5,
      position: 'Student',
      username: 'Amol ',
      email: 'jane.doe@example.com',
      active: true,
    },
    {
      id: 6,
      position: 'Sub-Admin',
      username: 'Sarthak ',
      email: 'admin.doe@example.com',
      active: false,
    },
    {
      id: 7,
      position: 'Teacher',
      username: 'Tejas Gade',
      email: 'john.doe@example.com',
      active: true,
    },
    {
      id: 8,
      position: 'Student',
      username: 'Amol ',
      email: 'jane.doe@example.com',
      active: true,
    },
    {
      id: 9,
      position: 'Sub-Admin',
      username: 'Sarthak ',
      email: 'admin.doe@example.com',
      active: false,
    },
  ]);

  const chartData = {
    labels: ['Active Users', 'Inactive Users'],
    datasets: [
      {
        data: [
          users.filter((user) => user.active).length,
          users.filter((user) => !user.active).length,
        ],
        backgroundColor: ['#28a745', '#dc3545'],
        hoverBackgroundColor: ['#218838', '#c82333'],
      },
    ],
  };

  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showModifyPopup, setShowModifyPopup] = useState(false);
  const usersPerPage = 5; // Reducing to 5 for better visibility

  const handleDelete = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    setShowDeletePopup(true);
  };

  const handleModify = (id, newName, newPosition, newEmail) => {
    const modifiedUser = users.find((user) => user.id === id);
    modifiedUser.username = newName;
    modifiedUser.position = newPosition;
    modifiedUser.email = newEmail;
    setUsers([...users]);
    setShowModifyPopup(true);
  };

  // const handleDownloadData = () => {
  //   const filteredData = users.filter((user) =>
  //     filter ? user.position === filter : true
  //   );
  
  //   const csvContent =
  //     'Name,Position,Email\n' +
  //     filteredData
  //       .map((user) => `${user.username},${user.position},${user.email}`)
  //       .join('\n');
  
  //   const blob = new Blob([csvContent], {
  //     type: 'text/csv;charset=utf-8',
  //   });
  
  //   const a = document.createElement('a');
  //   const url = URL.createObjectURL(blob);
  //   a.href = url;
  //   a.download = 'user_data.csv';
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };
  

  const handlePopupClose = () => {
    setShowDeletePopup(false);
    setShowModifyPopup(false);
  };

  

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>User List</h2>
        <div className="d-flex align-items-center">
          <span className="me-2">
            <FontAwesomeIcon icon={faFilter} />
          </span>
          <select
            className="form-select form-select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Teacher">Teacher</option>
            <option value="Student">Student</option>
            <option value="Sub-Admin">Sub-Admin</option>
          </select>
          {/* <button
            className="btn btn-primary ms-2"
            onClick={handleDownloadData}
            style={{ minWidth: '170px', whiteSpace: 'nowrap' }}
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Download Report
          </button> */}
        </div>
      </div>

      <table className="table table-hover" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th scope="col" className="text-center">
              Name
            </th>
            <th scope="col" className="text-center">
              Position
            </th>
            <th scope="col" className="text-center">
              Email
            </th>
            <th scope="col" className="text-center">
              Status
            </th>
            <th scope="col" className="text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr
              key={user.id}
              className={`align-middle ${
                !user.active ? 'table-danger' : ''
              } text-center`}
            >
              <td className="fw-bold">{user.username}</td>
              <td>{user.position}</td>
              <td className={`text-muted ${!user.active ? 'text-danger' : ''}`}>
                {user.email}
              </td>
              <td>
                <span
                  className={`badge bg-${user.active ? 'success' : 'danger'}`}
                >
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="btn-group">
                  <button
                    className="btn btn-link text-dark"
                    type="button"
                    id={`dropdownMenuButton${user.id}`}
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <FontAwesomeIcon icon={faEdit} className="me-1" />
                    {/* <FontAwesomeIcon icon={faTrashAlt} /> */}
                  </button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby={`dropdownMenuButton${user.id}`}
                  >
                    <button
                      className="dropdown-item"
                      onClick={() =>
                        handleModify(
                          user.id,
                          prompt('Enter new name', user.username),
                          prompt('Enter new position', user.position),
                          prompt('Enter new email', user.email)
                        )
                      }
                    >
                      Modify
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-center">
        {/* <Doughnut data={chartData} /> */}
      </div>

      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          {Array.from({ length: Math.ceil(users.length / usersPerPage) }).map(
            (page, index) => (
              <li
                className={`page-item ${
                  currentPage === index + 1 ? 'active' : ''
                }`}
                key={index}
              >
                <a
                  className="page-link .text-primary-emphasis"
                  onClick={() => paginate(index + 1)}
                  href="#!"
                >
                  {index + 1}
                </a>
              </li>
            )
          )}
        </ul>
      </nav>

      {showDeletePopup && (
        <PopupMessage
          message="Deleted successfully!"
          onClose={handlePopupClose}
        />
      )}
      {showModifyPopup && (
        <PopupMessage
          message="Modified successfully!"
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
};

export default UserList;

 //when i filter data that time show only position wise data on ui give me only where i change function not give me full code  