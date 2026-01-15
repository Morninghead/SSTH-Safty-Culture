'use client';

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (error: any) => void;
    onCancel?: () => void;
    fps?: number;
    qrbox?: number;
}

// Separate the scanner logic into a class to avoid React state issues
class QRScannerManager {
    private scanner: Html5Qrcode | null = null;
    private elementId: string;
    private isActive = false;

    constructor(elementId: string) {
        this.elementId = elementId;
    }

    async start(
        cameraId: string,
        config: { fps: number; qrbox: number },
        onSuccess: (text: string) => void
    ): Promise<boolean> {
        try {
            if (this.scanner?.isScanning) {
                await this.scanner.stop();
            }

            if (!this.scanner) {
                this.scanner = new Html5Qrcode(this.elementId, {
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                    verbose: false
                });
            }

            await this.scanner.start(
                cameraId,
                { fps: config.fps, qrbox: { width: config.qrbox, height: config.qrbox } },
                onSuccess,
                () => { }
            );

            this.isActive = true;
            return true;
        } catch (err) {
            console.error("Failed to start with camera ID:", err);

            // Try fallback
            try {
                await this.scanner?.start(
                    { facingMode: "user" },
                    { fps: config.fps, qrbox: { width: config.qrbox, height: config.qrbox } },
                    onSuccess,
                    () => { }
                );
                this.isActive = true;
                return true;
            } catch (fallbackErr) {
                console.error("Fallback failed:", fallbackErr);
                throw fallbackErr;
            }
        }
    }

    async stop(): Promise<void> {
        this.isActive = false;
        if (this.scanner?.isScanning) {
            try {
                await this.scanner.stop();
            } catch (e) {
                // Ignore stop errors
            }
        }
    }

    getIsActive(): boolean {
        return this.isActive;
    }
}

export default function Scanner({
    onScanSuccess,
    onScanError,
    onCancel,
    fps = 10,
    qrbox = 250,
}: ScannerProps) {
    const managerRef = useRef<QRScannerManager | null>(null);
    const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading');
    const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const elementId = "html5qr-code-region";

    // Initialize cameras
    useEffect(() => {
        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices && devices.length) {
                    setCameras(devices);
                    setSelectedCameraId(devices[0].id);
                } else {
                    setStatus('error');
                    setErrorMessage('No cameras found');
                }
            })
            .catch(() => {
                setStatus('error');
                setErrorMessage('Camera permission denied');
            });
    }, []);

    // Start scanner when camera is selected
    useEffect(() => {
        if (!selectedCameraId) return;

        // Create manager if not exists
        if (!managerRef.current) {
            managerRef.current = new QRScannerManager(elementId);
        }

        const manager = managerRef.current;
        let cancelled = false;

        const startScan = async () => {
            setStatus('loading');

            try {
                const containerWidth = document.getElementById(elementId)?.clientWidth || 300;
                const boxSize = Math.min(containerWidth - 40, qrbox);

                const success = await manager.start(
                    selectedCameraId,
                    { fps, qrbox: boxSize },
                    (text) => {
                        if (!cancelled) {
                            onScanSuccess(text);
                        }
                    }
                );

                if (success && !cancelled) {
                    setStatus('scanning');
                }
            } catch (err: any) {
                if (!cancelled) {
                    setStatus('error');
                    setErrorMessage(err.message || 'Failed to start camera');
                    onScanError?.(err);
                }
            }
        };

        startScan();

        return () => {
            cancelled = true;
            manager.stop();
        };
    }, [selectedCameraId, fps, qrbox, onScanSuccess, onScanError]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            managerRef.current?.stop();
        };
    }, []);

    const handleRetry = () => {
        setStatus('loading');
        setErrorMessage('');
        // Re-trigger by toggling camera
        const current = selectedCameraId;
        setSelectedCameraId('');
        setTimeout(() => setSelectedCameraId(current), 50);
    };

    return (
        <div className="w-full relative bg-black overflow-hidden rounded-lg flex flex-col min-h-[300px]">
            {/* Cancel Button */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute top-2 left-2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            )}

            {/* Camera Select */}
            {cameras.length > 0 && (
                <div className="absolute top-2 right-2 z-20">
                    <select
                        className="bg-black/50 text-white text-xs rounded p-1 border border-white/20"
                        value={selectedCameraId}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                    >
                        {cameras.map(cam => (
                            <option key={cam.id} value={cam.id}>
                                {cam.label || `Camera ${cam.id.slice(0, 8)}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Scanner Container */}
            <div id={elementId} className="w-full h-full min-h-[300px]" />

            {/* Loading State */}
            {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                    <div className="flex flex-col items-center gap-2 text-white">
                        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                        <span className="text-sm">Starting camera...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-4 gap-4">
                    <div className="text-red-400 text-sm text-center">{errorMessage}</div>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
                    >
                        Retry
                    </button>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
