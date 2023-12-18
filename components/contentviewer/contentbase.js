import { useSnackbar } from 'notistack';
import * as fbc from '../../firebase/firebaseConstants';
import ImageViewer from './imageview';
import PDFViewer from './pdfviewv2';
import VideoViewer from './videoview';
const ContentBase = ({ content }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  };

  return (
    <>
      <div className="d-flex p-2 bg-light rounded shadow-sm h-100">

        {(() => {
          switch (content[fbc.CONTENT_FILE].mime) {
            case "application/pdf":
              return (<><PDFViewer pdfURL={content[fbc.CONTENT_FILE].url} /></>);
            case "image/jpeg":
              return (<><ImageViewer url={content[fbc.CONTENT_FILE].url} /></>);
            case "video/url":
              return (<><VideoViewer url={content[fbc.CONTENT_FILE].url} onYoutube={content[fbc.CONTENT_ONYOUTUBE]} /></>);
            default:
              return null;
          }
        })()}


      </div>
    </>
  );
};

export default ContentBase;
