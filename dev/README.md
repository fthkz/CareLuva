# Development Tools and Test Files

This directory contains development artifacts, test files, and debugging tools for the CareLuva project.

## ⚠️ IMPORTANT: Development Only

**These files are for development and testing purposes only and should NEVER be deployed to production.**

## Files in this directory:

### Test Files
- `test-firebase-integration.html` - Firebase Firestore integration testing
- `test-firebase.html` - Basic Firebase connection testing  
- `test-google-signin.html` - Google Sign-In authentication testing
- `simple-test.html` - Simple functionality testing
- `simple-registration.html` - Simplified registration form testing

### Debug Files
- `debug-registration.html` - Registration form debugging
- `firebase-diagnostic.html` - Firebase diagnostic tools
- `firebase-viewer.html` - Firebase data viewer (if exists)
- `fix-local-data.html` - Local data debugging tools

### Working/Prototype Files
- `working-admin-panel.html` - Admin panel prototype
- `working-complete.html` - Complete workflow prototype

## Security Considerations

1. **Never deploy these files to production**
2. **These files may contain test data and debugging information**
3. **Some files may expose internal system details**
4. **Use authentication if these files must be accessible in development**

## Usage

These files are intended for:
- Local development testing
- Firebase integration debugging
- Authentication flow testing
- UI/UX prototyping
- Data validation testing

## Git Configuration

These files are excluded from production deployments via `.gitignore` rules that prevent the `dev/` directory from being included in production builds.
