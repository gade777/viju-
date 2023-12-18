import { COMPANYNAME, WEBAPPSUBTITLE, WEBAPPTITLE } from '@/constants/appconstants';

const AccessForbidden = ({ message }) => {

  return (
    <div className="auth-wrapper d-flex mh-100 mw-100 bg-secondary"
      style={{ height: '100vh' }}>
      <div className="auth-content d-flex h-100 w-100">
        <div className="card shadow-lg  rounded-3 col-md-auto col-12 m-auto ">
          <div className="row align-items-center text-center">
            <div className="card px-1">
              <div className="card-header p-5  d-flex flex-row align-items-center">
                <div className=" d-flex flex-row align-items-center w-auto mx-auto">
                  <img
                    src="../assets/images/xllogo.svg"
                    alt=""
                    className="img-fluid  w-25  rounded-circle p-2"
                  />
                  <div className="d-flex flex-column w-100 align-items-start ps-4 border-start ms-4">
                    <span className="fs-4  text-dark fw-bolder">
                      {WEBAPPTITLE}
                    </span>
                    <span className="fs-7 my-2 fw-bold text-secondary">
                      {WEBAPPSUBTITLE}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-body py-3 px-2">
                <h3 className="mt-2 mb-2 text-center w-100 f-w-400 fw-bold fs-3">
                  Access Forbidden
                </h3>
                <h6 className="text-start text-center w-100 f-w-400 text-capitalize">
                  Please contact administrator to get access to this page.
                </h6>
                <br />
                <span className="mb-0 text-muted text-sm text-capitalize">
                  {COMPANYNAME}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessForbidden;
