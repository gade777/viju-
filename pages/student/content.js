
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import ContentBase from '../../components/contentviewer/contentbase';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import * as fbc from '../../firebase/firebaseConstants';
import { db } from '../../firebase/firebaseconfig';
import * as utility from '../../libraries/utility';

const ContentDetails = () => {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [lessons, setlessons] = useState([]);
  const [contentDetails, setcontentDetails] = useState(null);
  const [contentuid, setContentUID] = useState(null);


  useEffect(() => {
    let contentuid = router.query.view;
    setContentUID(() => {
      return contentuid
    });
  }, []);

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
    if (contentuid !== null && contentuid !== undefined) {
      console.log(contentuid);
      fetchcontentdetails(contentuid);
    }
  }, [contentuid]);

  async function fetchcontentdetails(uid) {
    utility.showloading();
    const docRef = doc(db, fbc.CONTENT_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    utility.hideloading();
    if (docSnap.exists()) {
      console.log(docSnap.data());
      setcontentDetails(docSnap.data());

    } else {
      setcontentDetails(null);
    }
  }


  return (
    <div>

      <div className="d-flex flex-column flex-root app-root mh-100" style={{ height: '100vh' }} id="kt_app_root">
        <div
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={contentDetails != null ? contentDetails[fbc.CONTENT_HEADING] : ""} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-2 mh-100 scroll"
              id="kt_app_main"
            >

              {contentDetails != null ?
                <>

                  <ContentBase content={contentDetails} />

                </> : <></>

              }

            </div>

          </div>
        </div>
      </div>


    </div>
  );
};

export default ContentDetails;
export async function getStaticProps() {
  return {
    props: { module: 'STUDENTCONTENTDETAILS', onlyAdminAccess: false },
  };
}
