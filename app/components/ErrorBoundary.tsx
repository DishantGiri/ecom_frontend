"use client";

import React from "react";

interface Props {
    children: React.ReactNode;
    /** Optional custom fallback. Defaults to a minimal "something went wrong" page. */
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
}

/**
 * ErrorBoundary — catches any unhandled render errors in the component tree
 * and renders a clean fallback instead of a white crash screen.
 *
 * This is intentionally a class component because React's error boundary
 * API (componentDidCatch / getDerivedStateFromError) only works in classes.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Log to console in dev; in production you could send to Sentry / Datadog here
        console.warn("[ErrorBoundary] Caught render error:", error.message, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div
                        style={{
                            minHeight: "60vh",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "16px",
                            fontFamily: "inherit",
                            padding: "40px 24px",
                            textAlign: "center",
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#CBD5E1"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4" />
                            <path d="M12 16h.01" />
                        </svg>
                        <h2
                            style={{
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "#0F172A",
                                margin: 0,
                            }}
                        >
                            Something went wrong
                        </h2>
                        <p
                            style={{
                                fontSize: "15px",
                                color: "#64748B",
                                maxWidth: "380px",
                                lineHeight: 1.6,
                                margin: 0,
                            }}
                        >
                            We&apos;re having trouble loading this page right now. Please try
                            refreshing, or check back in a moment.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                marginTop: "8px",
                                padding: "10px 28px",
                                background: "#001f3f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: 700,
                                cursor: "pointer",
                                letterSpacing: "0.04em",
                            }}
                        >
                            Refresh page
                        </button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
