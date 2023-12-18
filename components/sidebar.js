import { useEffect, useState } from 'react';
import * as constants from '../constants/appconstants';
import * as fbc from '../firebase/firebaseConstants';
import * as utility from '../libraries/utility';
const { appendScript } = require('../libraries/appendScript');

const Sidebar = () => {
  const [userModules, setuserModules] = useState([]);
  const [isadmin, setisadmin] = useState(false);
  useEffect(() => {
    appendScript('../assets/js/layout/sidebar.js');

    setisadmin(utility.get_keyvalue(constants.USER_ISADMIN));
    setuserModules(utility.get_keyvalue(constants.USER_MODULEACCESS));
  }, []);

  useEffect(() => {
    if (userModules.length === 0) {
      return;
    }
    console.log(userModules);
    if (process.env.NEXT_PUBLIC_USERTYPE === 'EMP') {
      addModuleSidebar('Masters', fbc.MASTERMODULE, 'ri-database-2-line');
      addModuleSidebar('Courses & Subjects', fbc.COURSESMODULE, 'ri-book-fill');
    } else if (process.env.NEXT_PUBLIC_USERTYPE === 'TCH') {
      addModuleSidebar('Courses & Subjects', fbc.COURSESMODULE, 'ri-book-fill');
    } else if (process.env.NEXT_PUBLIC_USERTYPE === 'STD') {
      addModuleSidebar('Home', fbc.STUDENTMODULE, 'ri-home-3-fill');
    }

    var e = window.location.href.split(/[?#]/)[0];
    console.log('e : ' + e);

    $('.menu-link').each(function () {
      var e = window.location.href.split(/[?#]/)[0];
      if (this.href == e) {
        this.classList.add('active');
      }
    });
  }, [userModules]);

  function findCommonElements(arr1, arr2) {
    return arr1.some((item) => arr2.includes(item));
  }
  function addModuleSidebar(menuName, moduleObject, icon) {
    var isMainModuleApplicable = false;
    var subMenus = ``;
    Object.keys(moduleObject).map((key) => {
      if (key === 'modules') {
        Object.keys(moduleObject.modules).map((moduleKey) => {
          var module = moduleObject.modules[moduleKey];
          if (userModules.includes(moduleKey) || isadmin) {
            isMainModuleApplicable = true;
            subMenus += `
              <div class="menu-item">
                    <a
                      class="menu-link"
                      href="${module.path}"
                    >
                      <span class="menu-bullet">
                        <span class="bullet bullet-dot"></span>
                      </span>
                      <span class="menu-title">${module.label}</span>
                    </a>
                  </div>`;
          }
        });
      } else {
        var moduleDetails = moduleObject[key];
        var moduleItems = ``;

        if (moduleDetails.modules != undefined) {
          Object.keys(moduleDetails.modules).map((moduleKey) => {
            var module = moduleDetails.modules[moduleKey];
            moduleItems += `
              <div class="menu-item">
                    <a
                      class="menu-link"
                      href="${module.path}"
                    >
                      <span class="menu-bullet">
                        <span class="bullet bullet-dot"></span>
                      </span>
                      <span class="menu-title">${module.label}</span>
                    </a>
                  </div>`;
          });

          var subMenu = `
        <div data-kt-menu-trigger="click" class="menu-item menu-accordion">
        
                      <span class="menu-link">
                          <span class="menu-bullet">
                            <span class="bullet bullet-dot"></span>
                          </span>
                          <span class="menu-title">${moduleDetails.label}</span>
                          <span class="menu-arrow"></span>
                        </span>
                      <div class="menu-sub menu-sub-accordion">
                            ${moduleItems}
                      </div>
        </div>`;

          if (moduleItems.length > 0) {
            isMainModuleApplicable = true;
            subMenus += subMenu;
          }
        }
        // else {
        //   isMainModuleApplicable = true;
        //   subMenus += `
        //       <div class="menu-item">
        //             <a
        //               class="menu-link"
        //               href="${moduleDetails.path}"
        //             >
        //               <span class="menu-bullet">
        //                 <span class="bullet bullet-dot"></span>
        //               </span>
        //               <span class="menu-title">${moduleDetails.label}</span>
        //             </a>
        //           </div>`;
        // }
      }
    });

    var mainmenu = `<div
                data-kt-menu-trigger="click"
                class="menu-item here  show menu-accordion">
                 <span class="menu-link">
                  <span class="menu-icon">
                    <i class="${icon} fs-2"></i>
                  </span>
                  <span class="menu-title ms-2">${menuName}</span>
                  <span class="menu-arrow"></span>
                </span>
                ${subMenus.length > 0 ? `<div class="menu-sub menu-sub-accordion">
                ${subMenus}
                </div>`: ``}
                </div>
                `;

    if (isMainModuleApplicable) {
      $('#kt_app_sidebar_menu').append(mainmenu);
    }
  }

  return (
    <>
      <div
        id="kt_app_sidebar"
        className="app-sidebar flex-column"
        data-kt-drawer="true"
        data-kt-drawer-name="app-sidebar"
        data-kt-drawer-activate="{default: true, lg: false}"
        data-kt-drawer-overlay="true"
        data-kt-drawer-width="250px"
        data-kt-drawer-direction="start"
        data-kt-drawer-toggle="#kt_app_sidebar_mobile_toggle"
      >
        <div
          className="app-sidebar-header d-flex flex-stack d-none d-lg-flex pt-5 pb-2"
          id="kt_app_sidebar_header"
        >
          <a className="app-sidebar-logo">
            <img
              alt="Logo"
              src="../../assets/media/logos/default.svg"
              className="h-25px d-none d-sm-inline app-sidebar-logo-default theme-light-show"
            />
            <img
              alt="Logo"
              src="../../assets/media/logos/default.svg"
              className="h-20px h-lg-25px theme-dark-show"
            />
          </a>

          <div
            id="kt_app_sidebar_toggle"
            className="app-sidebar-toggle active btn btn-sm btn-icon bg-light btn-color-gray-700 btn-active-color-primary d-none d-lg-flex rotate"
            data-kt-toggle="true"
            data-kt-toggle-state="active"
            data-kt-toggle-target="main"
            data-kt-toggle-name="app-sidebar-minimize"
          >
            <span className="svg-icon svg-icon-4 rotate-180">
              <svg
                width="24"
                height="21"
                viewBox="0 0 24 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="14"
                  height="3"
                  rx="1.5"
                  transform="matrix(-1 0 0 1 24 0)"
                  fill="currentColor"
                />
                <rect
                  width="24"
                  height="3"
                  rx="1.5"
                  transform="matrix(-1 0 0 1 24 9)"
                  fill="currentColor"
                />
                <rect
                  width="18"
                  height="3"
                  rx="1.5"
                  transform="matrix(-1 0 0 1 24 18)"
                  fill="currentColor"
                />
              </svg>
            </span>
          </div>
        </div>

        <div
          className="app-sidebar-navs flex-column-fluid py-6"
          id="kt_app_sidebar_navs"
        >
          <div
            id="kt_app_sidebar_navs_wrappers"
            className="app-sidebar-wrapper hover-scroll-y my-2"
            data-kt-scroll="true"
            data-kt-scroll-activate="true"
            data-kt-scroll-height="auto"
            data-kt-scroll-dependencies="#kt_app_sidebar_header"
            data-kt-scroll-wrappers="#kt_app_sidebar_navs"
            data-kt-scroll-offset="5px"
          >
            <div
              id="kt_app_sidebar_menu"
              data-kt-menu="true"
              data-kt-menu-expand="false"
              className="app-sidebar-menu-primary menu menu-column menu-rounded menu-sub-indention menu-state-bullet-primary"
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
