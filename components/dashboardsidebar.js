import UserMenu from './user-menu';

const DashboardSidebar = () => {
  // useEffect(() => {
  //   appendScript('../assets/js/layout/sidebar.js');
  // }, []);

  return (
    <>
      <div
        id="kt_app_sidebar"
        className="app-sidebar flex-column"
        data-kt-drawer="true"
        data-kt-drawer-name="app-sidebar"
        data-kt-drawer-activate="{default: true, lg: false}"
        data-kt-drawer-overlay="true"
        data-kt-drawer-width="275px"
        data-kt-drawer-direction="start"
        data-kt-drawer-toggle="#kt_app_sidebar_toggle"
      >
        <div
          className="d-flex flex-stack px-4 px-lg-6 py-3 py-lg-8"
          id="kt_app_sidebar_logo"
        >
          <a href="../../demo23/dist/index.html">
            <img
              alt="Logo"
              src="assets/media/logos/demo23.svg"
              className="h-20px h-lg-25px theme-light-show"
            />
            <img
              alt="Logo"
              src="assets/media/logos/demo23-dark.svg"
              className="h-20px h-lg-25px theme-dark-show"
            />
          </a>

          <div className="ms-3">
            <UserMenu />
          </div>
        </div>

        <div
          className="flex-column-fluid px-4 px-lg-8 py-4"
          id="kt_app_sidebar_nav"
        >
          <div
            id="kt_app_sidebar_nav_wrapper"
            className="d-flex flex-column hover-scroll-y pe-4 me-n4"
            data-kt-scroll="true"
            data-kt-scroll-activate="true"
            data-kt-scroll-height="auto"
            data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer"
            data-kt-scroll-wrappers="#kt_app_sidebar, #kt_app_sidebar_nav"
            data-kt-scroll-offset="5px"
          >
            <div className="d-flex mb-3 mb-lg-6">
              <div className="border border-gray-300 border-dashed rounded min-w-100px w-100 py-2 px-4 me-6">
                <span className="fs-6 text-gray-500 fw-bold">Budget</span>

                <div className="fs-2 fw-bold text-success">$14,350</div>
              </div>

              <div className="border border-gray-300 border-dashed rounded min-w-100px w-100 py-2 px-4">
                <span className="fs-6 text-gray-500 fw-bold">Spent</span>

                <div className="fs-2 fw-bold text-danger">$8,029</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-gray-800 fw-bold mb-8">Services</h3>

              <div
                className="row row-cols-2 row-cols-lg-3"
                data-kt-buttons="true"
                data-kt-buttons-target="[data-kt-button]"
              >
                <div className="col mb-4">
                  <a
                    href="../../demo23/dist/apps/file-manager/folders.html"
                    className="btn btn-icon btn-outline btn-bg-light btn-active-light-primary btn-flex flex-column flex-center w-90px h-90px border-gray-200"
                    data-kt-button="true"
                  >
                    <span className="mb-2">
                      <span className="ri-percent-fill fs-4"></span>
                    </span>

                    <span className="fs-7 fw-bold">Utilities</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex-column-auto d-flex flex-center px-4 px-lg-8 py-3 py-lg-8"
          id="kt_app_sidebar_footer"
        >
          <div className="app-footer-item">
            <a
              href="../../demo23/dist/account/settings.html"
              className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px"
            >
              <span className="ri-percent-fill"></span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
