"use client";

import { useEffect, useState } from "react";

const IMAGES = [
    "/backgrounds/bg-1.jpg",
    "/backgrounds/bg-2.jpg",
    "/backgrounds/bg-3.jpg",
    "/backgrounds/bg-4.jpg",
    "/backgrounds/bg-5.jpg",
    "/backgrounds/bg-6.jpg",
    "/backgrounds/bg-7.jpg",
    "/backgrounds/bg-8.jpg",
];

export function useBackground() {
    const [backgroundImage, setBackgroundImage] = useState<string>("");

    useEffect(() => {
        // Select a random image only on the client side to avoid hydration mismatch
        const randomImage = IMAGES[Math.floor(Math.random() * IMAGES.length)];
        setBackgroundImage(randomImage);
    }, []);

    return backgroundImage;
}
