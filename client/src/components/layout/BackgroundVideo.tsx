interface BackgroundVideoProps {
    videoUrl?: string;
}

const BackgroundVideo = ({ videoUrl }: BackgroundVideoProps) => {
    return (
        <div className="fixed inset-0 z-[-1] w-full h-full overflow-hidden">
            {videoUrl && (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>
            )}

            {/* Global Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
    );
};

export default BackgroundVideo;
