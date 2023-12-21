import { useSnackbar } from 'notistack';
import { useRef, useState } from 'react';
// import DocViewer from "react-doc-viewer";
const PDFContentViewer = ({ pdfURL }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  };
  const [page, setPage] = useState(1);
  const canvasRef = useRef(null);

  // const { pdfDocument, pdfPage } = usePdf({
  //   file: pdfURL,
  //   page,
  //   canvasRef,
  // });
  return (
    <>

      {/* <DocViewer documents={[{ uri: pdfURL }]} /> */}
      {/* <div>
        {!pdfDocument && <span>Loading...</span>}
        <canvas ref={canvasRef} />
        {Boolean(pdfDocument && pdfDocument.numPages) && (
          <nav>
            <ul className="pager">
              <li className="previous">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
              </li>
              <li className="next">
                <button
                  disabled={page === pdfDocument.numPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div> */}
      <iframe src={pdfURL + "&embedded=true#toolbar=0"}
        width="100%" height="100%" />

      {/* <object data="mypdf.pdf" className='w-100 mh-100' src={pdfURL + "#toolbar=0"}  type="application/pdf">
        <embed width="100%" height="100%" />
      </object> */}
    </>
  );
};

export default PDFContentViewer;
