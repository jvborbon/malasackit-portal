import bcrypt from 'bcryptjs';

// Function to hash a password
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Function to compare password with hash
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Utility function to generate test hashes (for development only)
/*export const generateTestHashes = async () => {
    const passwords = [
        { user: 'admin', password: 'admin123' },
        { user: 'staff', password: 'staff123' },
        { user: 'donor', password: 'donor123' }
    ];
    
    console.log('🔐 Test Password Hashes:');
    for (const { user, password } of passwords) {
        const hash = await hashPassword(password);
        console.log(`${user}@test.com (${password}): ${hash}`);
    }
};*/