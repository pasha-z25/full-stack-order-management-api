import MoonLoader from 'react-spinners/MoonLoader';

export default function Loader() {
  return (
    <div className="absolute inset-0">
      <div className="placeholder absolute inset-0 bg-white opacity-50" />
      <p className="absolute top-1/2 left-1/2 inline-block -translate-x-1/2 -translate-y-1/2">
        <MoonLoader
          color={'green'}
          speedMultiplier={0.5}
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </p>
    </div>
  );
}
