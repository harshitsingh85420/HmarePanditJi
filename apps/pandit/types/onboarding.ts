export type TravelMode = '🚗 खुद की गाड़ी' | '🚂 ट्रेन' | '✈️ फ्लाइट' | '🚕 टैक्सी' | '🚌 बस';
export type PackageType = 'BASIC' | 'STANDARD' | 'PREMIUM';

export interface OnboardingState {
    currentStep: number;
    completedSteps: number[];
    basicInfo: {
        fullName: string;
        dateOfBirth: string;
        gender: 'MALE' | 'FEMALE' | 'OTHER';
        homeCity: string;
        homeState: string;
        experienceYears: number;
        bio: string;
        profilePhotoUrl: string;
        aadhaarNumber: string;
        panNumber: string;
    };
    specializations: {
        pujaTypes: string[];
        languages: string[];
        gotra: string;
        vedicDegree: string;
        specialCertifications: string[];
    };
    travelPreferences: {
        willingToTravel: boolean;
        maxTravelDistanceKm: number;
        preferredTravelModes: TravelMode[];
        requiresAccommodation: boolean;
        requiresFoodArrangement: boolean;
        localServiceRadius: number;
        outOfDelhiAvailable: boolean;
    };
    samagriSetup: {
        canBringSamagri: boolean;
        packages: {
            packageType: PackageType;
            name: string;
            description: string;
            price: number;
            items: string[];
        }[];
    };
    kycStatus: {
        videoUploaded: boolean;
        videoUrl: string;
        aadhaarFrontUrl: string;
        aadhaarBackUrl: string;
        selfieWithAadhaarUrl: string;
        submittedAt: string;
    };
    bankDetails: {
        accountHolderName: string;
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountType: 'SAVINGS' | 'CURRENT';
    };
}
