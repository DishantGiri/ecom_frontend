"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    animation?: "up" | "fade" | "left" | "right" | "scale";
    delay?: number;
    threshold?: number;
    once?: boolean;
    className?: string; // Add optional className for custom styles
}

export default function ScrollReveal({
    children,
    animation = "up",
    delay = 0,
    threshold = 0.1,
    once = true,
    className = "", // Default to empty string
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    if (once) observer.unobserve(entry.target);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [delay, once, threshold]);

    const animationClasses = {
        up: "reveal",
        fade: "reveal-fade-in",
        left: "reveal-slide-left",
        right: "reveal-slide-right",
        scale: "reveal-scale-up",
    };

    return (
        <div
            ref={ref}
            className={`${animationClasses[animation]} ${isVisible ? "reveal-visible" : ""} ${className}`}
        >
            {children}
        </div>
    );
}
