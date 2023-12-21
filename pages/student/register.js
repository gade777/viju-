import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
import { ulid } from 'ulid';

import { auth } from '@/firebase/firebaseconfig';
import Head from '../../components/head';
import { COMPANYNAME, WEBAPPTAGLINE } from '../../constants/appconstants';
import * as fbc from '../../firebase/firebaseConstants';
import { RequestregisterStudent } from '../../firebase/masterAPIS';
import * as utility from '../../libraries/utility';
const StudentRegister = () => {
  const renterpassword = useRef(null);
  const boardname = useRef(null);
  const city = useRef(null);
  const country = useRef(null);
  const address = useRef(null);
  const pincode = useRef(null);
  const state = useRef(null);
  const schoolname = useRef(null);
  const fullname = useRef(null);
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
    utility.hideloading();
  }, []);


  const checkifDataisCorrect = () => {
    $('.form-control').removeClass('is-invalid');
    var message = '';
    if (
      utility.isInputEmpty('fullname') ||
      utility.getinputValue('fullname').length < 6
    ) {
      $('#fullname').addClass('is-invalid');
      message = 'Please Enter A Valid Full Name, Minimum 6 Characters.';
      utility.showtippy('fullname', message, 'danger');
      showsnackbar('error', message);
      return false;
    }
    else if (utility.isInputEmpty('schoolname')) {
      $("#schoolname").addClass("is-invalid");
      message = ("Please Add A School Name")
      utility.showtippy('schoolname', message);
      showsnackbar('error', message)
      return false;
    }
    else if (utility.isInputEmpty('boardname')) {
      $("#boardname").addClass("is-invalid");
      message = ("Please Add A Board Name")
      utility.showtippy('boardname', message);
      showsnackbar('error', message)
      return false;
    } else if (utility.isInputEmpty('address')) {
      $("#address").addClass("is-invalid");
      message = ("Please Add Address")
      utility.showtippy('address', message);
      showsnackbar('error', message)
      return false;
    } else if (utility.isInputEmpty('city')) {
      $("#city").addClass("is-invalid");
      message = ("Please Add City")
      utility.showtippy('city', message);
      showsnackbar('error', message)
      return false;
    } else if (utility.isInputEmpty('pincode')) {
      $("#pincode").addClass("is-invalid");
      message = ("Please Add Pincode")
      utility.showtippy('pincode', message);
      showsnackbar('error', message)
      return false;
    }
    else if (utility.isInputEmpty('state')) {
      $("#state").addClass("is-invalid");
      message = ("Please Add State")
      utility.showtippy('state', message);
      showsnackbar('error', message)
      return false;
    }
    else if (utility.isInputEmpty('country')) {
      $("#country").addClass("is-invalid");
      message = ("Please Add Country")
      utility.showtippy('country', message);
      showsnackbar('error', message)
      return false;
    }
    else if (utility.isInputEmpty('emailaddress') || !(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(utility.getinputValue('emailaddress')))) {
      $("#emailaddress").addClass("is-invalid");
      message = ("Please Add A Valid Email Address")
      utility.showtippy('emailaddress', message);
      showsnackbar('error', message)
      return false;
    }
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
      return true;
    }
  };


  async function signUpUser() {
    if (checkifDataisCorrect()) {
      var stduid = "STD" + ulid();
      var stdObj = {
        [fbc.STUDENT_UID]: stduid,
        [fbc.STUDENT_DETAILS]: {
          schoolname: utility.getinputValue('schoolname'),
          boardname: utility.getinputValue('boardname'),
          address: utility.getinputValue('address'),
          city: utility.getinputValue('city'),
          pincode: utility.getinputValue('pincode'),
          state: utility.getinputValue('state'),
          country: utility.getinputValue('country'),
        },
        [fbc.STUDENT_NAME]: utility.getinputValue('fullname'),
        [fbc.STUDENT_EMAILADDRESS]: utility.getinputValue('emailaddress'),
        [fbc.STUDENT_COURSES]: []
      };
      utility.showloading();
      var registerStudent = await RequestregisterStudent(stdObj, utility.getinputValue('password'));
      utility.hideloading()
      if (registerStudent.status) {
        utility.showloading()
        signInWithEmailAndPassword(auth, utility.getinputAllinLowercase('emailaddress'),
          utility.getinputValue('password'))
          .then((userCredential) => {
            sendEmailVerification(userCredential.user)
              .then(() => {
                utility.hideloading();
                utility.success_alert(
                  'Verification Email Sent To ' + utility.getMaskedEmail(userCredential.user.email),
                  'Verify Email and Login Again.',
                  'OKAY',
                  (() => {
                    window.history.replaceState(null, null, '/login');
                    window.location = '/login';
                  }),
                  null
                );
              })
              .catch((error) => {
                console.log(error);
                errorCallback(error);
              });
          })
          .catch((error) => {
            errorCallback(error);
          });
      } else {
        var message = 'Failed To Register, ' + registerStudent.message;
        showsnackbar('error', message);
      }
    }
  }


  return (
    <main className="d-flex flex-column" style={{ height: '100vh' }}>
      <Head title={'Register'} />

      <div className="d-flex flex-column flex-lg-row flex-column-fluid">
        <div className="d-flex flex-column flex-lg-row-fluid w-lg-30 p-10 order-2 order-lg-1">
          <div className="d-flex flex-center flex-column flex-lg-row-fluid">
            <div className="w-lg-500px w-100 py-10 px-0">
              <div className="d-flex flex-center flex-column-fluid pb-5">
                <div className="d-flex flex-column w-100">
                  <div className="text-start mb-7 mb-lg-15">
                    <h1 className="text-dark fw-bolder mb-3 fs-1">
                      Sign up to continue.
                    </h1>

                    <div className="text-gray-500 fw-semibold fs-5">
                      Please Enter Your Details.
                    </div>
                  </div>

                  <div className="input-group   fv-row mb-8">
                    <span className="input-group-text">
                      <i className="ri-user-smile-fill fs-5"></i>
                    </span>
                    <input
                      type="text"
                      ref={fullname}
                      id="fullname"

                      className="form-control bg-transparent mb-0"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="row mb-8">
                    <div className="col-12 col-md-6 ">
                      <div className="input-group">
                        <input
                          type="text"
                          ref={schoolname}
                          id="schoolname"

                          className="form-control bg-transparent mb-0"
                          placeholder="School Name"
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-6 ">
                      <div className="input-group">
                        <input
                          type="text"
                          ref={boardname}
                          id="boardname"

                          className="form-control bg-transparent mb-0"
                          placeholder="Board"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row mb-8">
                    <div className="col-12 ">
                      <div className="input-group">
                        <input
                          type="text"
                          ref={address}
                          id="address"

                          className="form-control bg-transparent mb-0"
                          placeholder="Address"
                        />
                      </div>
                    </div>

                  </div>
                  <div className="row mb-8">
                    <div className="col-12 col-md-6 ">
                      <div className="input-group">
                        <input
                          type="text"
                          ref={city}
                          id="city"

                          className="form-control bg-transparent mb-0"
                          placeholder="City"
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-6 ">
                      <div className="input-group">
                        <input
                          type="text"
                          ref={pincode}
                          id="pincode"

                          className="form-control bg-transparent mb-0"
                          placeholder="Pin Code"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row mb-8">
                    <div className="col-12 col-md-6 ">
                      <div className="input-group">
                        <input
                          type="text"
                          ref={state}
                          id="state"

                          className="form-control bg-transparent mb-0"
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-6 ">
                      <div className="input-group">
                        <input
                          type="text"
                          ref={country}
                          id="country"

                          className="form-control bg-transparent mb-0"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                  <label className="form-check-label fs-6 mb-2 text-warning text-start w-100">
                    Verification Email Will Be Sent To This Email Address.
                  </label>
                  <div className="input-group  fv-row mb-8">
                    <span className="input-group-text">
                      <i className="ri-at-fill fs-5"></i>
                    </span>
                    <input
                      type="text"
                      ref={emailaddress}
                      id="emailaddress"

                      className="form-control bg-transparent mb-0"
                      placeholder="Email Address"
                    />
                  </div>

                  <label className="form-check-label fs-6 mb-2 text-warning text-start w-100">
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

                      className="form-control bg-transparent mb-0  fs-6   mb-0"
                      placeholder="Re-Enter Password"
                    />
                  </div>

                  <div className="d-grid mb-10">
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
              {WEBAPPTAGLINE}
            </h1>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentRegister;
export async function getStaticProps() {
  return {
    props: { accesstype: ['STUDENTREGISTER'], onlyAdminAccess: false },
  };
}
