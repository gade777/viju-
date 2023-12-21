import { hideloading, showloading } from "@/libraries/utility";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";


export default function PDFViewer({ pdfURL }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1); // start on first page
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(0);


  useEffect(() => {

    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

    showloading()


  }, [pdfURL])

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }) {
    setNumPages(nextNumPages);
  }
  function onDocumentLoadError(error) {
    console.log(pdfjs.version);
    console.log(error);
  }

  function onPageLoadSuccess() {
    setPageWidth($("#divid").width());
    setLoading(false);
    hideloading()
  }

  const options = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "standard_fonts/",
  };

  // Go to next page
  function goToNextPage() {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  }

  function goToPreviousPage() {
    setPageNumber((prevPageNumber) => prevPageNumber - 1);
  }


  return (
    <>
      <div
        hidden={loading}
        // style={{ height: "calc(100vh - 64px)" }}
        className="d-flex flex-column items-center w-100"
      >
        <div
          className="d-flex flex-row align-items-center mx-auto"
        >
          <button
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="btn btn-sm btn-primary"
          >
            <span className="sr-only">Previous</span>

            <i className="ri-next"></i>

          </button>

          <div className="bg-light-primary p-2 ">
            <span>{pageNumber}</span>
            <span className="text-gray-400"> / {numPages}</span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="btn btn-sm btn-primary"
          >
            <span className="sr-only">Next</span>
            <i
              className="ri-next"

            ></i>
          </button>
        </div>

        <div id="divid" className="d-flex w-100">

          {
            pdfURL !== null ? <>

              <Document
                file={pdfURL}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                options={options}
                renderMode="canvas"
                className=""
              >
                <Page
                  className=""
                  // key={pageNumber}
                  pageNumber={pageNumber}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  onLoadSuccess={onPageLoadSuccess}
                  onRenderError={() => setLoading(false)}
                  width={pageWidth}
                />

              </Document>

            </> : <>
            </>
          }

        </div>
      </div>
    </>
  );
}

