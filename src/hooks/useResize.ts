import { useState, useEffect } from 'react';

const useResize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth - 150,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth - 150,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowSize;
};

export default useResize;