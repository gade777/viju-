import { useEffect } from 'react';
import * as constants from '../constants/appconstants';
import * as utility from '../libraries/utility';
const { appendScript } = require('../libraries/appendScript');
const UserMenu = () => {
  useEffect(() => {
    // appendScript('../../../assets/js/layout/sidebar.js');
  }, []);

  return (
    <>
      <div
        className="cursor-pointer symbol symbol-circle symbol-25px symbol-md-35px"
        data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
      >
        <img src="../../assets/images/faces/2.jpg" alt="user" />
        <div className="position-absolute rounded-circle bg-success start-100 top-100 h-8px w-8px ms-n3 mt-n3"></div>
      </div>

      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px"
        data-kt-menu="true"
      >
        <div className="menu-item px-3">
          <div className="menu-content d-flex align-items-center px-3">
            <div className="symbol symbol-50px me-5">
              <img alt="Logo" src="../../assets/images/faces/2.jpg" />
            </div>

            <div className="d-flex flex-column">
              <div className="fw-bold d-flex align-items-center fs-5">
                {utility.get_keyvalue(constants.USER_FULLNAME)}

                {utility.get_keyvalue(constants.USER_ISADMIN) ? (
                  <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">
                    ADMIN
                  </span>
                ) : (
                  <></>
                )}
              </div>
              <span href="#" className="w-75 fw-semibold text-muted text-wrap text-truncate fs-7">
                {utility.get_keyvalue(constants.USER_LOGINID)}
              </span>
            </div>
          </div>
        </div>

        <div className="separator my-2"></div>


        {

          (process.env.NEXT_PUBLIC_USERTYPE === 'STD') ? <>
            <div className="menu-item px-5 my-1">
              <a
                href="../student/select-course" className="menu-link px-5">
                Change Course
              </a>
            </div>
          </> : <></>

        }
        <div className="menu-item px-5 my-1">
          <a className="menu-link px-5">
            Account Settings
          </a>
        </div>

        <div className="menu-item px-5">
          <a onClick={() => utility.signOutUser()} className="menu-link px-5">
            Sign Out
          </a>
        </div>
      </div>
    </>
  );
};

export default UserMenu;
