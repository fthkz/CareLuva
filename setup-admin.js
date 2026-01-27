#!/usr/bin/env node

/**
 * Admin User Setup Script
 * 
 * This script helps you set up the first admin user in Firestore.
 * 
 * Usage:
 *   node setup-admin.js <USER_UID> <USER_EMAIL> [USER_NAME]
 * 
 * Example:
 *   node setup-admin.js abc123xyz admin@careluva.com "Admin User"
 * 
 * Prerequisites:
 *   - Firebase CLI installed and logged in
 *   - User account exists in Firebase Authentication
 *   - User UID can be found in Firebase Console → Authentication → Users
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdmin() {
    console.log('🔧 CareLuva Admin Setup Script\n');
    console.log('This script will create an admin user in Firestore.\n');

    // Get user UID
    let userUid = process.argv[2];
    if (!userUid) {
        userUid = await question('Enter the user UID (from Firebase Authentication): ');
    }

    // Get user email
    let userEmail = process.argv[3];
    if (!userEmail) {
        userEmail = await question('Enter the user email: ');
    }

    // Get user name (optional)
    let userName = process.argv[4] || 'Admin User';
    if (!process.argv[4]) {
        const nameInput = await question('Enter admin name (default: "Admin User"): ');
        if (nameInput.trim()) {
            userName = nameInput.trim();
        }
    }

    // Validate inputs
    if (!userUid || !userEmail) {
        console.error('❌ Error: UID and email are required');
        process.exit(1);
    }

    // Create admin document data
    const adminData = {
        uid: userUid,
        email: userEmail,
        name: userName,
        role: 'admin',
        permissions: [
            'view_registrations',
            'approve_registrations',
            'reject_registrations',
            'manage_providers',
            'moderate_reviews'
        ],
        createdAt: new Date().toISOString(),
        createdBy: 'cli_setup'
    };

    console.log('\n📋 Admin Data to Create:');
    console.log(JSON.stringify(adminData, null, 2));
    console.log('\n');

    // Confirm
    const confirm = await question('Create this admin user? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
        console.log('❌ Cancelled');
        rl.close();
        return;
    }

    try {
        // Check if Firebase CLI is available
        try {
            execSync('firebase --version', { stdio: 'ignore' });
        } catch (error) {
            console.error('❌ Error: Firebase CLI not found. Please install it first:');
            console.error('   npm install -g firebase-tools');
            process.exit(1);
        }

        // Check if logged in
        try {
            execSync('firebase projects:list', { stdio: 'ignore' });
        } catch (error) {
            console.error('❌ Error: Not logged in to Firebase. Please run:');
            console.error('   firebase login');
            process.exit(1);
        }

        // Create the document using Firebase CLI
        console.log('🚀 Creating admin user...');
        
        // Escape the JSON for shell
        const escapedData = JSON.stringify(adminData).replace(/"/g, '\\"');
        
        // Use firebase firestore:set command
        const command = `firebase firestore:set admins/${userUid} "${escapedData}" --project careluva-5635e`;
        
        try {
            execSync(command, { stdio: 'inherit' });
            console.log('\n✅ Admin user created successfully!');
            console.log(`\n📧 Email: ${userEmail}`);
            console.log(`🆔 UID: ${userUid}`);
            console.log(`👤 Name: ${userName}`);
            console.log('\n🎉 The user can now access the admin panel.');
        } catch (error) {
            console.error('\n❌ Error creating admin user.');
            console.error('\n💡 Alternative: Create manually in Firebase Console:');
            console.error('   1. Go to Firestore Database');
            console.error('   2. Create collection: admins');
            console.error(`   3. Create document with ID: ${userUid}`);
            console.error('   4. Add the fields shown above');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }

    rl.close();
}

// Run the script
setupAdmin().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});

