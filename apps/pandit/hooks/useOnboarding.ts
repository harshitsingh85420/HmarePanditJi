import { useState, useEffect } from 'react';
import { OnboardingState } from '../types/onboarding';

const DEFAULT_STATE: OnboardingState = {
    currentStep: 1,
    completedSteps: [],
    basicInfo: {
        fullName: '',
        dateOfBirth: '',
        gender: 'MALE',
        homeCity: '',
        homeState: '',
        experienceYears: 0,
        bio: '',
        profilePhotoUrl: '',
        aadhaarNumber: '',
        panNumber: '',
    },
    specializations: {
        pujaTypes: [],
        languages: ['Hindi'],
        gotra: '',
        vedicDegree: 'कोई नहीं',
        specialCertifications: [],
    },
    travelPreferences: {
        willingToTravel: true,
        maxTravelDistanceKm: 100,
        preferredTravelModes: [],
        requiresAccommodation: false,
        requiresFoodArrangement: false,
        localServiceRadius: 20,
        outOfDelhiAvailable: true,
    },
    samagriSetup: {
        canBringSamagri: true,
        packages: [],
    },
    kycStatus: {
        videoUploaded: false,
        videoUrl: '',
        aadhaarFrontUrl: '',
        aadhaarBackUrl: '',
        selfieWithAadhaarUrl: '',
        submittedAt: '',
    },
    bankDetails: {
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountType: 'SAVINGS',
    },
};

const STORAGE_KEY = 'hmarepanditji_onboarding_state';

export function useOnboarding() {
    const [state, setState] = useState<OnboardingState>(() => {
        if (typeof window === 'undefined') return DEFAULT_STATE;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (err) {
                console.error('Failed to parse onboarding state', err);
            }
        }
        return DEFAULT_STATE;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const updateState = (updates: Partial<OnboardingState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const updateBasicInfo = (updates: Partial<OnboardingState['basicInfo']>) => {
        setState((prev) => ({
            ...prev,
            basicInfo: { ...prev.basicInfo, ...updates },
        }));
    };

    const updateSpecializations = (updates: Partial<OnboardingState['specializations']>) => {
        setState((prev) => ({
            ...prev,
            specializations: { ...prev.specializations, ...updates },
        }));
    };

    const updateTravelPreferences = (updates: Partial<OnboardingState['travelPreferences']>) => {
        setState((prev) => ({
            ...prev,
            travelPreferences: { ...prev.travelPreferences, ...updates },
        }));
    };

    const updateSamagriSetup = (updates: Partial<OnboardingState['samagriSetup']>) => {
        setState((prev) => ({
            ...prev,
            samagriSetup: { ...prev.samagriSetup, ...updates },
        }));
    };

    const updateKycStatus = (updates: Partial<OnboardingState['kycStatus']>) => {
        setState((prev) => ({
            ...prev,
            kycStatus: { ...prev.kycStatus, ...updates },
        }));
    };

    const updateBankDetails = (updates: Partial<OnboardingState['bankDetails']>) => {
        setState((prev) => ({
            ...prev,
            bankDetails: { ...prev.bankDetails, ...updates },
        }));
    };

    const completeStep = (step: number) => {
        setState((prev) => {
            const isAlreadyCompleted = prev.completedSteps.includes(step);
            return {
                ...prev,
                completedSteps: isAlreadyCompleted
                    ? prev.completedSteps
                    : [...prev.completedSteps, step].sort(),
            };
        });
    };

    const resetState = () => {
        setState(DEFAULT_STATE);
    };

    return {
        state,
        updateState,
        updateBasicInfo,
        updateSpecializations,
        updateTravelPreferences,
        updateSamagriSetup,
        updateKycStatus,
        updateBankDetails,
        completeStep,
        resetState,
    };
}
