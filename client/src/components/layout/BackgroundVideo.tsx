interface BackgroundVideoProps {
    videoUrl?: string;
}

const DEFAULT_VIDEO = 'https://res.cloudinary.com/dmeviky6f/video/upload/v1769730001/skproduction/library/xekeqyyrwf7zlwvwgmtg.mp4';

const BackgroundVideo = ({ videoUrl }: BackgroundVideoProps) => {
    const source = videoUrl || DEFAULT_VIDEO;

    return (
        <div className="fixed inset-0 z-[-1] w-full h-full overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
            >
                <source src={source} type="video/mp4" />
            </video>

            {/* Global Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
    );
};

export default BackgroundVideo;
