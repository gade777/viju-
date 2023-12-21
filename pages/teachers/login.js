import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword
} from 'react-firebase-hooks/auth';
import Head from '../../components/head';
import { COMPANYNAME, WEBAPPTAGLINE } from '../../constants/appconstants';
import { auth } from '../../firebase/firebaseconfig';
import { RequestloginCheckTeacher } from '../../firebase/masterAPIS';
import * as utility from '../../libraries/utility';

import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import * as constants from '../../constants/appconstants';
import { db } from '../../firebase/firebaseconfig';
import * as fbc from '../../firebase/firebaseConstants';
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
      var message = 'Please Enter Login ID.';
      utility.showtippy('loginid', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else {
      utility.showloading();
      getTeacherDetails();
    }
  };

  async function getTeacherDetails() {
    utility.showloading();
    var loginCheckTeacher = await RequestloginCheckTeacher(
      utility.getinputAllinLowercase('loginid')
    );
    utility.hideloading();
    if (loginCheckTeacher.status) {
      const userdata = loginCheckTeacher.data;
      if (userdata[fbc.TEACHER_STATUS]) {
        setUserDoc(userdata);
        if (userdata[fbc.TEACHER_ISSIGNEDUP]) {
          setloginType({
            type: LOGINTYPE.LOGIN,
            name: userdata[fbc.TEACHER_NAME],
          });
        } else {
          setloginType({
            type: LOGINTYPE.NEW,
            name: userdata[fbc.TEACHER_NAME],
          });
        }
      } else {
        errorCallback({
          message: 'Account Blocked, Please contact administrator.',
        });
      }
    } else {
      errorCallback({
        message: loginCheckTeacher.message,
      });
    }
  }
  const forgotPassword = () => {
    $('.form-control').removeClass('is-invalid');
    if (userDoc == null) {
      var message = 'Please Enter Login ID.';
      showsnackbar('error', message);
      return;
    }
    utility.showloading();
    sendPasswordResetEmail(auth, userDoc[fbc.TEACHER_EMAILADDRESS])
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
        userDoc[fbc.TEACHER_EMAILADDRESS],
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
        userDoc[fbc.TEACHER_EMAILADDRESS],
        utility.getinputValue('password')
      );
    }
  };

  async function loadData() {
    await updateUserSession()
    var userObject = {
      [fbc.TEACHER_PASSWORD]: utility.getinputValue('password'),
      [fbc.TEACHER_ISSIGNEDUP]: true,
    };
    var modules = ["TEACHERDASHBOARD", ...userDoc[fbc.TEACHER_MODULES]];
    try {
      var userRef = doc(db, fbc.TEACHER_COLLECTION, userDoc[fbc.TEACHER_UID]);
      await setDoc(userRef, userObject, { merge: true })
        .then(() => {
          utility.store_newvalue(constants.USER_ID, userDoc[fbc.TEACHER_UID]);
          utility.store_newvalue(
            constants.USER_FULLNAME,
            userDoc[fbc.TEACHER_NAME]
          );
          utility.store_newvalue(
            constants.USER_LOGINID,
            userDoc[fbc.TEACHER_EMAILADDRESS]
          );
          utility.store_newvalue(constants.USER_MODULEACCESS, modules);
          utility.store_newvalue(constants.USER_ISADMIN, false);
          window.history.replaceState(null, null, '/teachers/dashboard');
          window.location = '/teachers/dashboard';
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


  async function updateUserSession() {
    var timestamp = utility.getTimestamp()
    var loginData = {
      "name": loginDetails.name,
      "uid": userDoc[fbc.TEACHER_UID],
      "from": "WEB",
      loginTime: utility.getTime(),
      loginDate: utility.getDate(),
      loginTimestamp: timestamp
    }
    await setDoc(doc(db, "LoginSessionDetails/Teachers/" + userDoc[fbc.TEACHER_UID] + "/", timestamp.toString()), loginData)

  }

  return (
    <main className="d-flex flex-column" style={{ height: '100vh' }}>
      <Head title={'Login'} />

      <div
        className="d-flex flex-column flex-root app-blank bgi-size-cover bgi-position-center"
        id="kt_app_root"
        style={{ backgroundImage: "url('../../../assets/media/auth/bg4.jpg')" }}
      >
        <div className="d-flex flex-column flex-column-fluid flex-lg-row">
          <div className="d-flex flex-center w-lg-50 pt-15 pt-lg-0 px-10">
            <div className="d-flex flex-center flex-lg-start flex-column">
              <a className="mb-7">
                <img
                  alt="Logo"
                  src="../../../assets/media/logos/custom-3.svg"
                />
              </a>

              <h2 className="text-white text-center mx-auto fw-normal m-0">
                {WEBAPPTAGLINE}
              </h2>
            </div>
          </div>

          <div className="d-flex flex-center mt-15 w-lg-50 p-6">
            <div className="card rounded-3 w-100 w-md-450px">
              <div className="card-body d-flex flex-column p-6 p-lg-10 pb-lg-10">
                <div className="d-flex flex-center flex-column-fluid pb-5">
                  <div className="d-flex flex-column w-100">
                    <div className="text-center mb-15">
                      {(() => {
                        switch (loginDetails.type) {
                          case LOGINTYPE.CHECK:
                            return (
                              <>
                                <h1 className="text-dark fw-bolder mb-3 fs-1">
                                  Sign in to continue.
                                </h1>

                                <div className="text-gray-500 fw-semibold fs-4">
                                  Please Enter The Teacher Credentials Provided.
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
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, e.target.id)
                                  }
                                  disabled={
                                    loginDetails.type != LOGINTYPE.CHECK
                                  }
                                  className="form-control bg-transparent"
                                  placeholder="Login ID"
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
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, e.target.id)
                                  }
                                  className="form-control bg-transparent fs-6   mb-0"
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
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, e.target.id)
                                  }
                                  className="form-control bg-transparent  fs-6   mb-0"
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
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, e.target.id)
                                  }
                                  className="form-control bg-transparent fs-6   mb-0"
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

                <div className="d-flex flex-center">
                  <span className="text-muted text-center fw-semibold fs-6">
                    {COMPANYNAME}
                  </span>
                </div>
              </div>
            </div>
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
