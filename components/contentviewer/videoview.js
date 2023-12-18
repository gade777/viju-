import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
const VideoView = ({ url, onYoutube = false }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  };
  useEffect(() => {

    console.log(onYoutube);
  }, []);

  return (
    <>

      {onYoutube ? <>
        <div className="d-flex flex-row w-100 h-100">
          <iframe
            style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}
            width="100%" height="100%" src={url}>

          </iframe>
        </div>

      </> : <>

        <Script
          src="https://player.vimeo.com/api/player.js"
        />
        <div className="d-flex flex-row w-100 h-100">
          <iframe
            style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}
            width="100%" height="100%" src={url + "?h=ddc6b2130a&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"}>

          </iframe>
        </div>
      </>}


    </>
  );
};

export default VideoView;
