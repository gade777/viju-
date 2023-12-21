import { sendPasswordResetEmail } from 'firebase/auth';
import { arrayUnion, doc, setDoc } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword,
} from 'react-firebase-hooks/auth';
import Head from '../components/head';
import * as constants from '../constants/appconstants';
import { COMPANYNAME } from '../constants/appconstants';
import * as fbc from '../firebase/firebaseConstants';
import { auth, db } from '../firebase/firebaseconfig';
import { RequestloginCheckEmployee } from '../firebase/masterAPIS';
import * as utility from '../libraries/utility';
const LOGINTYPE = {
  NEW: 'NEW',
  CHECK: 'CHECK',
  LOGIN: 'LOGIN',
};

const Login = () => {
  const [signup, signupuser, signuploading, signuperror] =
    useCreateUserWithEmailAndPassword(auth);

  const [signin, signinuser, signinloading, signinerror] =
    useSignInWithEmailAndPassword(auth);
  const renterpassword = useRef(null);
  const password = useRef(null);
  const loginid = useRef(null);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

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
  const [userDoc, setUserDoc] = useState(null);
  const [userLoginType, setLoginType] = useState(null);
  const [loginDetails, setloginType] = useState({
    type: LOGINTYPE.CHECK,
    name: '',
  });
  useEffect(() => {
    localStorage.clear();
    auth.signOut();
    utility.hideloading();
  }, []);

  useEffect(() => {
    switch (loginDetails.type) {
      case LOGINTYPE.CHECK:
        loginid.current.value = '';
        loginid.current.focus();
        break;
      case LOGINTYPE.NEW:
        password.current.value = '';
        password.current.focus();
        break;
      case LOGINTYPE.LOGIN:
        password.current.value = '';
        password.current.focus();
        break;
      default:
        break;
    }
  }, [loginDetails]);

  const handleKeyDown = (event, id) => {
    if (event.key === 'Enter') {
      switch (id) {
        case 'loginid':
          checkUser();
          break;
        case 'password':
          if (loginDetails.type === LOGINTYPE.LOGIN) {
            loginUser();
          }
          break;
        case 'renterpassword':
          if (loginDetails.type === LOGINTYPE.NEW) {
            signUpUser();
          }
          break;

        default:
          break;
      }
    }
  };

  const checkUser = () => {
    $('.form-control').removeClass('is-invalid');
    if (utility.isInputEmpty('loginid')) {
      $('#loginid').addClass('is-invalid');
      var message = 'Please Enter Email Address.';
      utility.showtippy('loginid', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else {
      utility.showloading();
      getEmployeeDetails();
    }
  };

  async function getEmployeeDetails() {
    utility.showloading();
    var loginCheckEmployee = await RequestloginCheckEmployee(
      utility.getinputAllinLowercase('loginid')
    );
    utility.hideloading();
    if (loginCheckEmployee.status) {
      const userdata = loginCheckEmployee.data;
      if (userdata[fbc.EMPLOYEE_STATUS]) {
        setUserDoc(userdata);
        if (userdata[fbc.EMPLOYEE_ISSIGNEDUP]) {
          setloginType({
            type: LOGINTYPE.LOGIN,
            name: userdata[fbc.EMPLOYEE_NAME],
          });
        } else {
          setloginType({
            type: LOGINTYPE.NEW,
            name: userdata[fbc.EMPLOYEE_NAME],
          });
        }
      } else {
        errorCallback({
          message: 'Account Blocked, Please contact Administrator.',
        });
      }
    } else {
      errorCallback({
        message: loginCheckEmployee.message,
      });
    }
  }
  const forgotPassword = () => {
    $('.form-control').removeClass('is-invalid');
    if (userDoc == null) {
      var message = 'Please Enter Email Address.';
      showsnackbar('error', message);
      return;
    }
    utility.showloading();
    sendPasswordResetEmail(auth, userDoc[fbc.EMPLOYEE_EMAILADDRESS])
      .then(() => {
        utility.hideloading();
        utility.success_alert(
          'Password Reset Link Sent To Associated Email Address.',
          'Reset Password By Following The Link.',
          'OKAY',
          utility.reloadPage,
          null
        );
      })
      .catch((error) => {
        console.log(error);
        errorCallback(error);
      });
  };
  const loginUser = () => {
    $('.form-control').removeClass('is-invalid');
    if (
      utility.isInputEmpty('password') ||
      utility.getinputValue('password').length < 6
    ) {
      $('#password').addClass('is-invalid');
      var message = 'Please Enter A Valid Password, Minimum 6 Characters.';
      utility.showtippy('password', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else {
      signin(
        userDoc[fbc.EMPLOYEE_EMAILADDRESS],
        utility.getinputValue('password')
      );
    }
  };

  if (signinerror) {
    errorCallback(signinerror);
  }
  if (signinloading) {
    utility.showloading();
    console.log('signinloading');
  }
  if (signinuser) {
    console.log('USER LOGGED IN');
    loadData();
  }
  if (signuperror) {
    errorCallback(signuperror);
  }
  if (signuploading) {
    utility.showloading();
    console.log('signuploading');
  }
  if (signupuser) {
    console.log('USER CREATED');
    loadData();
  }

  const signUpUser = () => {
    $('.form-control').removeClass('is-invalid');
    var message = '';
    if (
      utility.isInputEmpty('password') ||
      utility.getinputValue('password').length < 6
    ) {
      $('#password').addClass('is-invalid');
      message = 'Please Enter A Valid Password, Minimum 6 Characters.';
      utility.showtippy('password', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (
      utility.isInputEmpty('renterpassword') ||
      utility.getinputValue('renterpassword').length < 6
    ) {
      $('#renterpassword').addClass('is-invalid');
      message = 'Please Enter A Valid Password, Minimum 6 Characters.';
      utility.showtippy('renterpassword', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (
      utility.getinputValue('renterpassword') !==
      utility.getinputValue('password')
    ) {
      $('#password').addClass('is-invalid');
      $('#renterpassword').addClass('is-invalid');
      message = "Password Doesn't Match.";
      utility.showtippy('password', message, 'danger');
      utility.showtippy('renterpassword', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else {
      signup(
        userDoc[fbc.EMPLOYEE_EMAILADDRESS],
        utility.getinputValue('password')
      );
    }
  };

  async function loadData() {
    var userObject = {};

    var loginData = {
      loginTime: utility.getTime(),
      loginDate: utility.getDate(),
      loginTimestamp: utility.getTimestamp(),
    };

    switch (loginDetails.type) {
      case LOGINTYPE.NEW:
        userObject = {
          [fbc.EMPLOYEE_PASSWORD]: utility.getinputValue('password'),
          [fbc.EMPLOYEE_ISSIGNEDUP]: true,
          [fbc.EMPLOYEE_SESSIONDETAILS]: arrayUnion(loginData),
        };
        break;

      case LOGINTYPE.LOGIN:
        userObject = {
          [fbc.EMPLOYEE_SESSIONDETAILS]: arrayUnion(loginData),
        };
        break;
      default:
        return null;
    }

    var modules = ['EMPLOYEEDASHBOARD', ...userDoc[fbc.EMPLOYEE_MODULES]];

    try {
      var userRef = doc(db, fbc.EMPLOYEE_COLLECTION, userDoc[fbc.EMPLOYEE_UID]);
      await setDoc(userRef, userObject, { merge: true })
        .then(() => {
          utility.store_newvalue(constants.USER_ID, userDoc[fbc.EMPLOYEE_UID]);
          utility.store_newvalue(
            constants.USER_FULLNAME,
            userDoc[fbc.EMPLOYEE_NAME]
          );
          utility.store_newvalue(
            constants.USER_LOGINID,
            userDoc[fbc.EMPLOYEE_CODE]
          );
          utility.store_newvalue(constants.USER_MODULEACCESS, modules);

          utility.store_newvalue(
            constants.USER_ISADMIN,
            userDoc[fbc.EMPLOYEE_ISADMIN]
          );
          window.history.replaceState(null, null, '/dashboard');
          window.location = '/dashboard';
        })
        .catch((error) => {
          errorCallback(error);
        });
    } catch (err) {
      utility.hideloading();
      console.log('Unsuccessful returned error', err);
      errorCallback(err);
    }
  }

  return (
    <main className="d-flex flex-column" style={{ height: '100vh' }}>
      <Head title={'Login'} />

      <div className="d-flex flex-column flex-lg-row flex-column-fluid">
        <div className="d-flex flex-column flex-lg-row-fluid w-lg-30 p-10 order-2 order-lg-1">
          <div className="d-flex flex-center flex-column flex-lg-row-fluid">
            <div className="w-lg-500px w-100 py-10 px-0">
              <div className="d-flex flex-center flex-column-fluid pb-5">
                <div className="d-flex flex-column w-100">
                  <div className="text-start mb-7 mb-lg-15">
                    {(() => {
                      switch (loginDetails.type) {
                        case LOGINTYPE.CHECK:
                          return (
                            <>
                              <h1 className="text-dark fw-bolder mb-3 fs-1">
                                Sign in to continue.
                              </h1>

                              <div className="text-gray-500 fw-semibold fs-4">
                                Please Enter the credentials provided.
                              </div>
                            </>
                          );
                        case LOGINTYPE.NEW:
                          return (
                            <>
                              <h1 className="text-dark fw-bolder mb-3 fs-1">
                                Welcome {loginDetails.name}.
                              </h1>

                              <div className="text-gray-500 fw-semibold fs-4">
                                Please Create Your Password and Continue.
                              </div>
                            </>
                          );

                        case LOGINTYPE.LOGIN:
                          return (
                            <>
                              <h1 className="text-dark fw-bolder mb-3 fs-1">
                                Welcome {loginDetails.name}.
                              </h1>

                              <div className="text-gray-500 fw-semibold fs-4">
                                Please Enter Your Password and Continue.
                              </div>
                            </>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </div>

                  {(() => {
                    switch (loginDetails.type) {
                      case LOGINTYPE.CHECK:
                        return (
                          <>
                            <div className="input-group  fv-row mb-8">
                              <span className="input-group-text">
                                <i className="ri-user-smile-fill fs-5"></i>
                              </span>
                              <input
                                type="text"
                                ref={loginid}
                                id="loginid"
                                onKeyDown={(e) => handleKeyDown(e, e.target.id)}
                                disabled={loginDetails.type != LOGINTYPE.CHECK}
                                className="form-control bg-transparent mb-0"
                                placeholder="Email Address"
                              />
                            </div>
                          </>
                        );
                      case LOGINTYPE.NEW:
                        return (
                          <>
                            <label className="form-check-label text-md  mb-3 text-warning text-start w-100">
                              Create Password Minimum 6 Characters
                            </label>
                            <div
                              id="passworddiv"
                              className="input-group  fv-row mb-8"
                            >
                              <span className="input-group-text">
                                <i className="ri-lock-password-fill fs-5"></i>
                              </span>
                              <input
                                type="password"
                                ref={password}
                                defaultValue=""
                                id="password"
                                autoComplete="off"
                                onKeyDown={(e) => handleKeyDown(e, e.target.id)}
                                className="form-control bg-transparent mb-0 fs-6   mb-0"
                                placeholder="Password"
                              />
                            </div>
                            <div
                              id="reenterpassworddiv"
                              className="input-group  fv-row mb-8"
                            >
                              <span className="input-group-text">
                                <i className="ri-lock-password-fill fs-5"></i>
                              </span>
                              <input
                                type="password"
                                ref={renterpassword}
                                defaultValue=""
                                autoComplete="off"
                                id="renterpassword"
                                onKeyDown={(e) => handleKeyDown(e, e.target.id)}
                                className="form-control bg-transparent mb-0  fs-6   mb-0"
                                placeholder="Re-Enter Password"
                              />
                            </div>
                          </>
                        );

                      case LOGINTYPE.LOGIN:
                        return (
                          <>
                            <div
                              id="passworddiv"
                              className="input-group  fv-row mb-8"
                            >
                              <span className="input-group-text">
                                <i className="ri-lock-password-fill fs-5"></i>
                              </span>
                              <input
                                type="password"
                                ref={password}
                                defaultValue=""
                                id="password"
                                autoComplete="off"
                                onKeyDown={(e) => handleKeyDown(e, e.target.id)}
                                className="form-control bg-transparent mb-0 fs-6   mb-0"
                                placeholder="Password"
                              />
                            </div>
                          </>
                        );
                      default:
                        return null;
                    }
                  })()}

                  <div className="d-grid mb-10">
                    {(() => {
                      switch (loginDetails.type) {
                        case LOGINTYPE.CHECK:
                          return (
                            <button
                              id="nextbtn"
                              onClick={(e) => checkUser()}
                              className="btn btn-block  btn-primary"
                            >
                              NEXT
                            </button>
                          );
                        case LOGINTYPE.NEW:
                          return (
                            <>
                              <button
                                id="signupbtn"
                                onClick={(e) => signUpUser()}
                                className="btn btn-block  btn-primary mb-2 w-100"
                              >
                                Sign Up
                              </button>
                              <button
                                id="cancelbtn"
                                onClick={(e) => utility.reloadPage()}
                                className="btn btn-block btn-secondary mb-4 w-100"
                              >
                                Cancel
                              </button>
                            </>
                          );
                        case LOGINTYPE.LOGIN:
                          return (
                            <>
                              <button
                                id="loginbtn"
                                onClick={(e) => loginUser()}
                                className="btn btn-block  btn-primary mb-2 w-100"
                              >
                                Login
                              </button>
                              <button
                                id="loginbtn"
                                onClick={(e) => forgotPassword()}
                                className="btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary mb-2 w-100"
                              >
                                Forgot Password ?
                              </button>
                              <button
                                id="cancelbtn"
                                onClick={(e) => utility.reloadPage()}
                                className="btn btn-block btn-secondary mb-4 w-100"
                              >
                                Cancel
                              </button>
                            </>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-lg-500px d-flex flex-center px-10 mx-auto">
            <span className="text-muted text-center fw-semibold fs-6">
              {COMPANYNAME}
            </span>
          </div>
        </div>

        <div
          className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
          style={{
            backgroundImage: "url('assets/media/patterns/pattern-1.jpg')",
          }}
        >
          <div className="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100">
            <div className="mb-0 mb-lg-10">
              <img
                alt="Logo"
                src="assets/media/logos/custom-3.svg"
                className="h-40px h-lg-75px"
              />
            </div>

            <h1 className="d-block text-white mx-auto fs-lg-1qx mt-2 fw-bolder text-center mb-lg-7">
              Online Academy.
            </h1>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
export async function getStaticProps() {
  return {
    props: { accesstype: ['CP', 'ADMIN'], onlyAdminAccess: false },
  };
}
