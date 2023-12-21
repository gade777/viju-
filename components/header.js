import { useEffect } from 'react';
import Head from './head';
import UserMenu from './user-menu';
import { COURSECOLORS } from '@/firebase/firebaseConstants';
const { appendScript } = require('../libraries/appendScript');
const Header = ({ title }) => {
  useEffect(() => {
    appendScript('../assets/js/layout/search.js');
  }, []);

  return (
    <>
      <Head title={title} />
      <div id="kt_app_header"  className="app-header">
        <div
          className="app-container container-fluid d-flex align-items-stretch flex-stack"
          id="kt_app_header_container"
        >
          <div
            className="d-flex align-items-center d-block d-lg-none ms-n3"
            title="Show sidebar menu"
          >
            <div
              className="btn btn-icon btn-active-color-primary w-35px h-35px me-2"
              id="kt_app_sidebar_mobile_toggle"
            >
              <span className="svg-icon svg-icon-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z"
                    fill="currentColor"
                  />
                  <path
                    opacity="0.3"
                    d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </div>

            <a>
              <img
                alt="Logo"
                src="../../assets/media/logos/default-small.svg"
                className="h-30px"
              />
            </a>
          </div>

          <div className="app-navbar flex-lg-grow-1" id="kt_app_header_navbar">
            <div className="app-navbar-item d-flex align-items-stretch flex-lg-grow-1">
              <div className="page-title d-flex flex-column justify-content-center me-3">
                <h1 className="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">
                  {title}
                </h1>
              </div>
            </div>

            <div
              className="app-navbar-item ms-1 ms-md-3"
              id="kt_header_user_menu_toggle"
            >
              <UserMenu />
            </div>
          </div>

          <div className="app-navbar-separator separator d-none d-lg-flex"></div>
        </div>
      </div>
    </>
  );
};

export default Header;
