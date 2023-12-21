import Script from 'next/script';
export default function ImportScript({ path, strategy = 'beforeInteractive' }) {
  return (
    <>
      <Script src={path} strategy={strategy} />
    </>
  );
}
