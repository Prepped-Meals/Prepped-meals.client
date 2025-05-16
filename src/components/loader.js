import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from '../assets/loading.json'; 

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white z-50 fixed top-0 left-0 w-full">
      <Player
        autoplay
        loop
        src={loadingAnimation}
        style={{ height: '200px', width: '200px' }}
      />
      <p className="text-lg text-gray-600 mt-4">Loading your page...</p>
    </div>
  );
};

export default Loader;
