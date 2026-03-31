'use client';

import React from 'react';
import { Modal } from '@hmarepanditji/ui';
import { LoginForm } from './LoginForm';

export interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    redirectAfterLogin?: string;
    role?: 'CUSTOMER' | 'PANDIT';
}

export function LoginModal({ isOpen, onClose, redirectAfterLogin, role = 'CUSTOMER' }: LoginModalProps) {
    const handleSuccess = () => {
        onClose();
        if (redirectAfterLogin) {
            window.location.href = redirectAfterLogin;
        } else {
            // Wait a brief moment before reload so any state changes propagate
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
        >
            <div className="pt-2">
                <LoginForm onSuccess={handleSuccess} defaultRole={role} hideGuestLink={true} />
            </div>
        </Modal>
    );
}

export default LoginModal;
