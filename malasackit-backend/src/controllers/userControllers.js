// src/controllers/userControllers.js
import { loginUser } from '../services/users/userAuth.js';
import { registerUser } from '../services/users/userRegistration.js'; // Re-enabled but logic disabled
import { generateToken, setTokenCookie, clearTokenCookie } from '../utilities/jwt.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        const result = await loginUser(email, password);
        
        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message
            });
        }
        
        const token = generateToken({
            userId: result.user.user_id,
            email: result.user.email,
            role: result.user.role_name
        });
        
        // Set HTTP-only cookie instead of sending token in response
        setTokenCookie(res, token);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user
                // Note: No token in response - it's in HTTP-only cookie
            }
        });
        
    } catch (error) {
        console.error('Login controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Clear the HTTP-only cookie
        clearTokenCookie(res);
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
        
    } catch (error) {
        console.error('Logout controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        // User info is available from middleware (JWT payload)
        // Convert JWT structure to match what frontend expects
        const userProfile = {
            user_id: req.user.userId,
            email: req.user.email,
            role_name: req.user.role,
            // Add other fields if needed
        };
        
        res.json({
            success: true,
            data: { user: userProfile }
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const register = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phoneNumber,
            donorType,
            streetAddress,
            regionId,
            provinceId,
            municipalityId,
            barangayId,
            vicariateId,
            parishId,
            customVicariate,
            customParish,
            password,
            repeatPassword
        } = req.body;

        // Validation
        if (!fullName || !email || !password || !repeatPassword) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, and passwords are required'
            });
        }

        if (password !== repeatPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        const result = await registerUser({
            fullName,
            email,
            phoneNumber,
            donorType: donorType || 'INDIVIDUAL',
            streetAddress,
            regionId: regionId ? parseInt(regionId) : null,
            provinceId: provinceId ? parseInt(provinceId) : null,
            municipalityId: municipalityId ? parseInt(municipalityId) : null,
            barangayId: barangayId ? parseInt(barangayId) : null,
            vicariateId: vicariateId ? parseInt(vicariateId) : null,
            parishId: parishId ? parseInt(parishId) : null,
            customVicariate,
            customParish,
            password
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.status(201).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Registration controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};