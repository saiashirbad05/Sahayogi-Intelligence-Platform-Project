import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TOUR_STEPS = [
    {
        target: "Command Center",
        text: "Welcome to the Sahayogi Terminal. Use the Sidebar on the left to navigate between Intelligence Chat, Explorer, and Reports.",
        position: "right"
    },
    {
        target: "Data Export",
        text: "In the Explore section, you can perform bulk CSV & PDF exports of the 50,000+ verified organizations.",
        position: "center"
    },
    {
        target: "Interactive Maps",
        text: "Click on any state within the Global Explorer to instantly cross-reference our regional resource distribution.",
        position: "center"
    }
];

export const OnboardingTour: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const location = useLocation();

    useEffect(() => {
        // Only show if not on home page and hasn't been dismissed before
        if (location.pathname === '/') return;

        const hasSeenTour = localStorage.getItem('sahayogi_tour_completed');
        if (!hasSeenTour) {
            setTimeout(() => setIsVisible(true), 1500); // Small delay to let page load
        }
    }, [location.pathname]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem('sahayogi_tour_completed', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'rgba(5, 8, 29, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    style={{
                        background: 'var(--navy-mid)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '24px',
                        padding: '32px',
                        maxWidth: '480px',
                        width: '100%',
                        position: 'relative',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
                        color: 'white'
                    }}
                >
                    <button
                        onClick={handleComplete}
                        style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        {TOUR_STEPS.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: i <= currentStep ? 'var(--brand-blue)' : 'rgba(255,255,255,0.1)'
                                }}
                            />
                        ))}
                    </div>

                    <h3 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800 }}>
                        {TOUR_STEPS[currentStep].target}
                    </h3>

                    <p style={{ margin: '0 0 32px', fontSize: '15px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
                        {TOUR_STEPS[currentStep].text}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            onClick={handleComplete}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                        >
                            Skip Tour
                        </button>
                        <button
                            onClick={handleNext}
                            style={{
                                background: 'var(--brand-blue)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none',
                                fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            {currentStep < TOUR_STEPS.length - 1 ? (
                                <>Next Step <ChevronRight size={16} /></>
                            ) : (
                                <>Get Started <CheckCircle size={16} /></>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
