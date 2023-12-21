import { useSnackbar } from 'notistack';
const ImageViewer = ({ url }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  };

  return (
    <>
      <iframe src={url + "#toolbar=0"}
        width="100%" height="100%" />  </>
  );
};

export default ImageViewer;
