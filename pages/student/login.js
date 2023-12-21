import { sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import Head from '../../components/head';
import * as constants from '../../constants/appconstants';
import { COMPANYNAME } from '../../constants/appconstants';
import * as fbc from '../../firebase/firebaseConstants';
import { auth, db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';

const Login = () => {


  const [user, setUser] = useState(null)
  const password = useRef(null);
  const emailaddress = useRef(null);
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

  useEffect(() => {
    localStorage.clear();
    auth.signOut();
    utility.hideloading();
    emailaddress.current.value = '';
    emailaddress.current.focus();
  }, []);


  const handleKeyDown = (event, id) => {
    if (event.key === 'Enter') {
      switch (id) {
        case 'password':
          loginUser();
          break;
        default:
          break;
      }
    }
  };


  const forgotPassword = () => {
    $('.form-control').removeClass('is-invalid');
    if (utility.isInputEmpty('emailaddress')) {
      $('#emailaddress').addClass('is-invalid');
      var message = 'Please Enter Email Address.';
      utility.showtippy('emailaddress', message, 'danger');
      showsnackbar('error', message);
      return false;
    }
    utility.showloading();
    sendPasswordResetEmail(auth, utility.getinputAllinLowercase('emailaddress'))
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
    $('.form-control').removeClass('is-invalid'); var message = ""
    if (utility.isInputEmpty('emailaddress')) {
      $('#emailaddress').addClass('is-invalid');
      message = 'Please Enter Email Address.';
      utility.showtippy('emailaddress', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else if (
      utility.isInputEmpty('password') ||
      utility.getinputValue('password').length < 6
    ) {
      $('#password').addClass('is-invalid');
      message = 'Please Enter A Valid Password, Minimum 6 Characters.';
      utility.showtippy('password', message, 'danger');
      showsnackbar('error', message);
      return false;
    } else {
      utility.showloading()
      signInWithEmailAndPassword(auth, utility.getinputAllinLowercase('emailaddress'), utility.getinputValue('password'))
        .then((userCredential) => {
          console.log({ userCredential });
          if (user === null) {
            if (userCredential.user.emailVerified) {
              setUser(userCredential.user)
            } else {
              utility.hideloading()
              utility.info_alert("Email Not Verified", "Send Verification Email To Registered Email Address?", 'SEND EMAIL', 'CANCEL', (() => {
                sendVerificationEmailForUser(userCredential.user)
              }), null)
            }
          }




        })
        .catch((error) => {
          errorCallback(error);
        });
    }
  };


  useEffect(() => {
    if (user === null) { return; }
    loadData()
  }, [user])

  const sendVerificationEmailForUser = (user) => {

    utility.showloading();
    sendEmailVerification(user)
      .then(() => {
        utility.hideloading();
        utility.success_alert(
          'Verification Email Sent To ' + utility.getMaskedEmail(user.email),
          'Verify Email and Login Again.',
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




  async function loadData() {


    await updateUserSession()
    var additionalModules = Object.keys(fbc.STUDENTMODULE.modules).map(key => {
      return key
    })
    var modules = ["STUDENTHOME", "STUDENTSUBJECTDETAILS", "STUDENTCONTENTDETAILS", ...additionalModules];
    try {
      var userRef = doc(db, fbc.STUDENT_COLLECTION, user.uid);
      const docSnap = await getDoc(userRef);
      var data = docSnap.data()
      utility.store_newvalue(constants.USER_ID, data[fbc.STUDENT_UID]);
      utility.store_newvalue(
        constants.USER_FULLNAME,
        data[fbc.STUDENT_NAME]
      );
      utility.store_newvalue(
        constants.USER_LOGINID,
        data[fbc.STUDENT_EMAILADDRESS]
      );
      utility.store_newvalue(constants.USER_MODULEACCESS, modules);
      utility.store_newvalue(constants.USER_ISADMIN, false);
      utility.store_newvalue(constants.USER_COURSES, data[fbc.STUDENT_COURSES]);

      if (data[fbc.STUDENT_COURSES].length === 0) {

        window.history.replaceState(null, null, '/student/select-course');
        window.location = '/student/select-course';
      } else {

        window.history.replaceState(null, null, '/student/home');
        window.location = '/student/home';
      }


    } catch (err) {
      utility.hideloading();
      console.log('Unsuccessful returned error', err);
      errorCallback(err);
    }
  }
  async function updateUserSession() {
    var timestamp = utility.getTimestamp()
    var loginData = {
      "email": user.email,
      "uid": user.uid,
      "from": "WEB",
      loginTime: utility.getTime(),
      loginDate: utility.getDate(),
      loginTimestamp: timestamp
    }
    await setDoc(doc(db, "LoginSessionDetails/student/" + user.uid + "/", timestamp.toString()), loginData)
  }
  function registerStudent() {
    window.history.replaceState(null, null, '../student/register');
    window.location = '../student/register';
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
                    <h1 className="text-dark fw-bolder mb-3 fs-1">
                      Sign in to continue.
                    </h1>

                    <div className="text-gray-500 fw-semibold fs-4">
                      Please Enter the credentials provided.
                    </div>
                  </div>

                  <div className="input-group  fv-row mb-8">
                    <span className="input-group-text">
                      <i className="ri-user-smile-fill fs-5"></i>
                    </span>
                    <input
                      type="text"
                      ref={emailaddress}
                      id="emailaddress"
                      className="form-control bg-transparent mb-0"
                      placeholder="Email Address"
                    />
                  </div>
                  <div
                    id="passworddiv"
                    className="input-group fv-row mb-8"
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

                  <div className="d-grid mb-10">
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
                      id="registerbtn"
                      onClick={(e) => registerStudent()}
                      className="btn btn-outline btn-outline-dashed btn-outline-success mb-4 w-100"
                    >
                      Don`&apos;t Have Account? Register.
                    </button>
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
            backgroundImage: "url('../../assets/media/patterns/pattern-1.jpg')",
          }}
        >
          <div className="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100">
            <div className="mb-0 mb-lg-10">
              <img
                alt="Logo"
                src="../../assets/media/logos/custom-3.svg"
                className="h-40px h-lg-75px"
              />
            </div>

            <h1 className="d-block text-white mx-auto fs-lg-1qx mt-2 fw-bolder text-center mb-lg-7">
              {constants.WEBAPPTAGLINE}
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
