import { signOut } from 'firebase/auth';
import { default as $, default as jQuery } from 'jquery';
import moment from 'moment';
import { useRouter } from 'next/router';
import { SnackbarProvider } from 'notistack';
import 'notyf/notyf.min.css';
import { useEffect, useRef, useState } from 'react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'remixicon/fonts/remixicon.css';
import 'tippy.js/animations/shift-away.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/dist/tippy.css';
import SystemError from '../components/SystemError';
import AccessForbidden from '../components/accessforbidden';
import LoadingBox from '../components/loading';
import {
  USER_ID,
  USER_ISADMIN,
  USER_MODULEACCESS,
} from '../constants/appconstants';
import { auth } from '../firebase/firebaseconfig';
import { RequestLiveDate } from '../firebase/masterAPIS';
import * as utility from '../libraries/utility';
import '../styles/sass/plugins.scss';
import '../styles/sass/style.scss';
const ACCESS = {
  ALLOWED: 'ALLOWED',
  FORBIDDEN: 'FORBIDDEN',
  LOADING: 'LOADING',
  ERROR: 'ERROR',
};
var errorMessage = '';

function MyApp({ Component, pageProps }) {
  let wasUserLoggedIn = useRef();
  const [user, loading, error] = useAuthState(auth);
  const [access, setAccess] = useState(ACCESS.LOADING);
  const router = useRouter();

  useEffect(() => {
    window.$ = $;
    window.jQuery = jQuery;
    window.moment = moment;
    if (typeof window !== 'undefined') {
      let WebApp = require('../constants/initWebApp.js');
      window.WebApp = WebApp;
      WebApp.init();
    }
  }, []);

  async function fetchLiveDate() {
    utility.showloading();
    var fetchLiveDate = await RequestLiveDate();
    if (fetchLiveDate.status) {

      checkUserData();
      // var dateuid = fetchLiveDate.data;
      // if (dateuid !== utility.getDateUID()) {
      //   errorMessage =
      //     'Failed To Validate Request, Please Check Your System Date and Time';
      //   setAccess(() => {
      //     return ACCESS.ERROR;
      //   });
      // } else {
      //   checkUserData();
      // }
    } else {
      errorMessage = 'Something Went Wrong ' + fetchLiveDate.message;
      setAccess(() => {
        return ACCESS.ERROR;
      });
    }
  }

  useEffect(() => {
    if (loading === undefined || loading === null) {
      return;
    }
    document.body.classList.add('app-default');
    if (!loading) {
      fetchLiveDate();
    }
  }, [loading]);

  useEffect(() => {
    if (access == ACCESS.ALLOWED && user) {
      console.log('IDLE ACTIVATED');
      document.onclick = function () {
        utility.store_newvalue('_idleSecondsCounter', 0);
      };
      document.onmousemove = function () {
        utility.store_newvalue('_idleSecondsCounter', 0);
      };
      document.onkeypress = function () {
        utility.store_newvalue('_idleSecondsCounter', 0);
      };
      window.setInterval(CheckIdleTime, 5000);
    }
  }, [access]);

  var IDLE_TIMEOUT = 12 * 30; //15 minutes
  var _idleSecondsCounter = 0;

  function CheckIdleTime() {
    _idleSecondsCounter = utility.get_keyvalue('_idleSecondsCounter');
    _idleSecondsCounter++;
    // console.log("counter :  " + _idleSecondsCounter);
    if (_idleSecondsCounter >= IDLE_TIMEOUT) {
      signOut(auth);
    } else {
      // console.log("timeout " + (IDLE_TIMEOUT - _idleSecondsCounter));
      utility.store_newvalue('_idleSecondsCounter', _idleSecondsCounter);
    }
  }

  function checkUserData() {
    var nextPage = ['/login'];
    console.log(process.env.NEXT_PUBLIC_USERTYPE);
    if (process.env.NEXT_PUBLIC_USERTYPE === 'ADM') {
      nextPage = ['/login'];
    } else if (process.env.NEXT_PUBLIC_USERTYPE === 'EMP') {
      nextPage = ['/login'];
    } else if (process.env.NEXT_PUBLIC_USERTYPE === 'TCH') {
      nextPage = ['/teachers/login'];
    } else if (process.env.NEXT_PUBLIC_USERTYPE === 'STD') {
      nextPage = ['/student/login', '/student/register'];
    }
 
    if (user) {
      var lastlogintimestamp = user.reloadUserInfo.lastLoginAt;
      lastlogintimestamp = Math.round(lastlogintimestamp / 1000);
      if (utility.getTimestamp() - lastlogintimestamp > 21600) {
        signOut(auth);
      }
    }

    if (error) {
      console.log('error : ' + error);
    }
 

    if (user === null) {
      // user has not logged in, current page is not login page, then navigate to login page
      wasUserLoggedIn = false;
      if (!nextPage.includes(router.pathname)) {
        utility.directSignout('..' + nextPage[0]);
      } else {
        // access forbidden
        setAccess(() => {
          return ACCESS.ALLOWED;
        });
      }
    } else {
      wasUserLoggedIn = true;
      if (utility.get_keyvalue(USER_ID) === 'nothingfound') {
        utility.directSignout('..' + nextPage[0]);
        return;
      }

      if (router.pathname === '/') {
        utility.directSignout('..' + nextPage[0]);
        return;
      }

      if (!nextPage.includes(router.pathname) && router.pathname !== '/') {
        if (utility.get_keyvalue(USER_ISADMIN)) {
          console.log('SET 1');

          setAccess(() => {
            return ACCESS.ALLOWED;
          });
        } else {
          if (
            utility.get_keyvalue(USER_MODULEACCESS).includes(pageProps.module)
          ) {
            setAccess(() => {
              return ACCESS.ALLOWED;
            });
          } else if (pageProps.onlyAdminAccess) {
            // access forbidden
            setAccess(() => {
              return ACCESS.FORBIDDEN;
            });
          } else {
            // access forbidden
            setAccess(() => {
              return ACCESS.FORBIDDEN;
            });
          }
        }
      } else {
        setAccess(() => {
          return ACCESS.ALLOWED;
        });
      }
    }
  }

  return (
    <SnackbarProvider>
      {(() => {
        if (access === ACCESS.ALLOWED) {
          return (
            <>
              <main
                id="kt_app_body"
                data-kt-app-header-fixed="true"
                data-kt-app-header-fixed-mobile="true"
                data-kt-app-sidebar-enabled="false"
                data-kt-app-sidebar-minimize="on"
                data-kt-app-sidebar-fixed="true"
                data-kt-app-sidebar-hoverable="true"
                data-kt-app-sidebar-push-header="true"
                data-kt-app-sidebar-push-toolbar="true"
                data-kt-app-sidebar-push-footer="true"
                data-kt-app-toolbar-enabled="true"
                className="app-default"
                style={{ height: '100vh' }}
              >
                <Component {...pageProps} />
              </main>
            </>
          );
        } else if (access === ACCESS.LOADING) {
          return <LoadingBox message={'Please Wait'} />;
        } else if (access === ACCESS.FORBIDDEN) {
          return <AccessForbidden />;
        } else if (access === ACCESS.ERROR) {
          return <SystemError message={errorMessage} />;
        }
      })()}
    </SnackbarProvider>
  );
}

export default MyApp;
