import { useState } from 'react';
import { loginUser, updateUserPassword } from '../services/authService';

export const usePasswordChange = (userEmail) => {
    const [currentPasswordInput, setCurrentPasswordInput] = useState('');
    const [newPasswordInput, setNewPasswordInput] = useState('');
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const triggerTimedMessage = (type, text) => {
        if (type === 'error') {
            setPasswordError(text);
            setPasswordSuccess('');
            setTimeout(() => {
                setPasswordError('');
            }, 3000);
        } else if (type === 'success') {
            setPasswordSuccess(text);
            setPasswordError('');
            setTimeout(() => {
                setPasswordSuccess('');
            }, 3000);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (currentPasswordInput === '' || newPasswordInput === '' || confirmPasswordInput === '') {
            triggerTimedMessage('error', 'Please fill in all password fields.');
            return;
        }
        if (newPasswordInput.length < 8) {
            triggerTimedMessage('error', 'New password must be at least 8 characters long.');
            return;
        }
        if (newPasswordInput !== confirmPasswordInput) {
            triggerTimedMessage('error', 'New passwords do not match!');
            return;
        }

        try {
            await loginUser(userEmail, currentPasswordInput);
            await updateUserPassword(newPasswordInput);

            triggerTimedMessage('success', 'Password successfully!!');
            setCurrentPasswordInput('');
            setNewPasswordInput('');
            setConfirmPasswordInput('');
        } catch (error) {
            triggerTimedMessage('error', 'Your current password is incorrect!');
        }
    };

    let hintText = 'Minimum 8 characters, at least 1 number';
    let hintColor = '#adb5bd';
    let isBold = 'normal';

    if (passwordError !== '') {
        hintText = passwordError;
        hintColor = '#dc3545';
        isBold = 'bold';
    } else if (passwordSuccess !== '') {
        hintText = passwordSuccess;
        hintColor = '#198754';
        isBold = 'bold';
    }

    return {
        currentPasswordInput,
        setCurrentPasswordInput,
        newPasswordInput,
        setNewPasswordInput,
        confirmPasswordInput,
        setConfirmPasswordInput,
        handleChangePassword,
        hintText,
        hintColor,
        isBold
    };
};
