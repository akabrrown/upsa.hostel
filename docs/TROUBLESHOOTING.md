# Troubleshooting Guide - UPSA Hostel Management System

## Overview
This comprehensive troubleshooting guide helps resolve common issues encountered by users, administrators, and developers of the UPSA Hostel Management System.

## Table of Contents
- [User Issues](#user-issues)
- [Admin Issues](#admin-issues)
- [System Issues](#system-issues)
- [Performance Issues](#performance-issues)
- [Security Issues](#security-issues)
- [Development Issues](#development-issues)
- [Emergency Procedures](#emergency-procedures)

---

## User Issues

### Login and Authentication

#### Problem: Cannot Login
**Symptoms:**
- Login page shows "Invalid credentials" error
- Page refreshes without logging in
- Browser shows authentication error

**Solutions:**
1. **Check Credentials:**
   - Verify email address is correct (@upsamail.edu.gh)
   - Check password spelling and case sensitivity
   - Ensure correct role is selected (student/admin/porter/director)

2. **Reset Password:**
   - Click "Forgot Password" on login page
   - Enter registered email address
   - Check email for reset link
   - Create new password following security requirements

3. **Clear Browser Cache:**
   - Clear browser cookies and cache
   - Try logging in with a different browser
   - Disable browser extensions temporarily

4. **Check Account Status:**
   - Contact admin to verify account is active
   - Confirm email verification is complete
   - Check if account is locked due to failed attempts

#### Problem: Session Expires Frequently
**Symptoms:**
- Logged out automatically after short time
- Must login repeatedly
- Session timeout messages

**Solutions:**
1. **Check Session Settings:**
   - Session timeout is 24 hours by default
   - Ensure "Remember Me" is checked if available
   - Check if multiple devices are logged in

2. **Browser Issues:**
   - Enable cookies in browser settings
   - Check browser's cookie settings for localhost
   - Try incognito/private browsing mode

3. **Network Issues:**
   - Check internet connection stability
   - Try different network if possible
   - Contact IT for network issues

### Profile and Account Issues

#### Problem: Cannot Update Profile
**Symptoms:**
- Save button doesn't work
- Changes not saved
- Error messages when updating

**Solutions:**
1. **Check Required Fields:**
   - Ensure all required fields are filled
   - Verify email format is correct
   - Check phone number format

2. **Validation Errors:**
   - Review error messages for specific issues
   - Ensure passwords meet security requirements
   - Check file upload limits and formats

3. **Permissions:**
   - Verify account has edit permissions
   - Contact admin if restrictions apply
   - Check if profile is locked by admin

### Room and Reservation Issues

#### Problem: Cannot View Available Rooms
**Symptoms:**
- Room list shows empty
- Filters don't work
- Page loading errors

**Solutions:**
1. **Check Room Availability:**
   - Verify rooms are actually available
   - Check if all rooms are allocated
   - Contact admin for room status

2. **Filter Issues:**
   - Clear all filters and try again
   - Check filter criteria are valid
   - Reset search parameters

3. **System Status:**
   - Check system announcements for maintenance
   - Verify booking period is open
   - Contact admin for system issues

#### Problem: Reservation Fails
**Symptoms:**
- Error when submitting reservation
- Reservation not confirmed
- Payment issues during booking

**Solutions:**
1. **Eligibility Check:**
   - Verify student is eligible for booking
   - Check payment status is current
   - Confirm no existing reservations

2. **Room Availability:**
   - Room may have been booked by someone else
   - Check room capacity limits
   - Try different room or time

3. **Payment Issues:**
   - Verify payment method is valid
   - Check account balance
   - Try alternative payment method

### Payment Issues

#### Problem: Payment Fails
**Symptoms:**
- Payment gateway errors
- Transaction declined
- Payment not recorded

**Solutions:**
1. **Payment Method:**
   - Verify card details are correct
   - Check card expiration date
   - Ensure sufficient funds

2. **Network Issues:**
   - Check internet connection
   - Try different payment method
   - Contact bank for card issues

3. **System Issues:**
   - Try payment again after 5 minutes
   - Clear browser cache
   - Contact admin for payment issues

#### Problem: Payment Not Reflected
**Symptoms:**
- Payment successful but not showing
- Receipt not generated
- Balance still shows due

**Solutions:**
1. **Wait for Processing:**
   - Allow 5-10 minutes for processing
   - Check email for payment confirmation
   - Refresh page after waiting

2. **Check Transaction:**
   - Verify with bank if payment was successful
   - Check email for payment receipt
   - Note transaction ID for reference

3. **Contact Support:**
   - Provide payment details and transaction ID
   - Include screenshots of payment confirmation
   - Contact finance department for verification

---

## Admin Issues

### Student Management

#### Problem: Cannot Add Student
**Symptoms:**
- Form validation errors
- Duplicate student error
- Database save errors

**Solutions:**
1. **Data Validation:**
   - Check all required fields are filled
   - Verify index number format (8 digits)
   - Ensure email ends with @upsamail.edu.gh

2. **Duplicate Check:**
   - Search for existing student with same index number
   - Check email already exists in system
   - Verify student not previously added

3. **Database Issues:**
   - Check database connection
   - Verify sufficient storage space
   - Contact database administrator

#### Problem: Student Data Not Updating
**Symptoms:**
- Changes not saved
- Old data still showing
- Update errors

**Solutions:**
1. **Permission Issues:**
   - Verify admin has edit permissions
   - Check if data is locked by another admin
   - Ensure student account is not frozen

2. **Data Validation:**
   - Check for invalid data formats
   - Verify required field completion
   - Review validation error messages

3. **System Issues:**
   - Clear browser cache
   - Try different browser
   - Check system maintenance status

### Room Management

#### Problem: Room Allocation Fails
**Symptoms:**
- Cannot assign student to room
- Room shows full when not
- Allocation conflicts

**Solutions:**
1. **Room Capacity:**
   - Verify actual room occupancy
   - Check for hidden allocations
   - Recalculate room capacity

2. **Student Eligibility:**
   - Confirm student is eligible for allocation
   - Check payment status
   - Verify student has no existing allocation

3. **System Conflicts:**
   - Check for concurrent allocations
   - Verify database integrity
   - Restart allocation process

#### Problem: Room Status Incorrect
**Symptoms:**
- Available rooms show occupied
- Occupied rooms show available
- Maintenance status wrong

**Solutions:**
1. **Data Sync:**
   - Run room status synchronization
   - Check for allocation conflicts
   - Update room manually if needed

2. **System Refresh:**
   - Clear system cache
   - Restart room management service
   - Rebuild room index

3. **Manual Override:**
   - Update room status manually
   - Document reason for override
   - Set up automatic correction

### Payment Management

#### Problem: Payment Records Not Syncing
**Symptoms:**
- Manual payments not showing
- Online payments not recorded
- Balance calculations wrong

**Solutions:**
1. **Sync Issues:**
   - Run payment synchronization
   - Check payment gateway connection
   - Verify database connectivity

2. **Data Entry:**
   - Verify manual payment details
   - Check receipt number format
   - Ensure correct student assignment

3. **System Issues:**
   - Check payment service status
   - Review error logs
   - Contact payment gateway support

---

## System Issues

### Database Problems

#### Problem: Database Connection Failed
**Symptoms:**
- "Database connection failed" errors
- Slow response times
- Data not loading

**Solutions:**
1. **Connection Check:**
   - Verify database server is running
   - Check connection string parameters
   - Test network connectivity to database

2. **Credentials:**
   - Verify database credentials
   - Check user permissions
   - Update expired passwords

3. **Server Issues:**
   - Restart database service
   - Check server resources
   - Contact database administrator

#### Problem: Data Corruption
**Symptoms:**
- Inconsistent data
- Missing records
- Strange query results

**Solutions:**
1. **Backup Recovery:**
   - Restore from recent backup
   - Verify backup integrity
   - Document corruption incident

2. **Data Repair:**
   - Run database repair utilities
   - Check for index corruption
   - Rebuild corrupted tables

3. **Prevention:**
   - Implement regular backups
   - Set up monitoring alerts
   - Review access logs

### Application Errors

#### Problem: 500 Internal Server Error
**Symptoms:**
- Server error pages
- Application crashes
- Functionality not working

**Solutions:**
1. **Log Analysis:**
   - Check application error logs
   - Review server error logs
   - Identify error patterns

2. **Service Restart:**
   - Restart application services
   - Clear application cache
   - Check server resources

3. **Code Issues:**
   - Review recent code changes
   - Roll back problematic updates
   - Test in staging environment

#### Problem: Slow Performance
**Symptoms:**
- Pages loading slowly
- Timeouts
- Unresponsive interface

**Solutions:**
1. **Performance Monitoring:**
   - Check server resource usage
   - Monitor database query times
   - Analyze application performance

2. **Optimization:**
   - Clear system cache
   - Optimize database queries
   - Implement caching strategies

3. **Scaling:**
   - Increase server resources
   - Load balance if needed
   - Optimize application code

---

## Performance Issues

### Frontend Performance

#### Problem: Slow Page Loading
**Symptoms:**
- Pages take long to load
- Images load slowly
- Interactive elements lag

**Solutions:**
1. **Browser Optimization:**
   - Clear browser cache
   - Disable unnecessary extensions
   - Update browser to latest version

2. **Network Issues:**
   - Check internet speed
   - Try different network
   - Use wired connection if possible

3. **Application Optimization:**
   - Enable lazy loading
   - Optimize image sizes
   - Implement code splitting

#### Problem: Memory Leaks
**Symptoms:**
- Browser becomes slow over time
- High memory usage
- Crashes after extended use

**Solutions:**
1. **Browser Management:**
   - Restart browser periodically
   - Close unused tabs
   - Monitor memory usage

2. **Application Issues:**
   - Report memory leak to developers
   - Use different browser temporarily
   - Clear browser data regularly

---

## Security Issues

### Authentication Security

#### Problem: Suspicious Login Activity
**Symptoms:**
- Unknown login attempts
- Account locked unexpectedly
- Security alerts

**Solutions:**
1. **Immediate Actions:**
   - Change password immediately
   - Enable two-factor authentication
   - Review recent activity

2. **Security Review:**
   - Check for unauthorized access
   - Review login locations
   - Update security settings

3. **Reporting:**
   - Report security incident
   - Document suspicious activity
   - Contact security team

#### Problem: Session Hijacking
**Symptoms:**
- Account accessed from unknown location
- Actions not performed by user
- Multiple active sessions

**Solutions:**
1. **Session Management:**
   - Log out from all devices
   - Change password
   - Review active sessions

2. **Security Measures:**
   - Enable session monitoring
   - Implement IP restrictions
   - Use secure connections only

---

## Development Issues

### Build and Deployment

#### Problem: Build Fails
**Symptoms:**
- Compilation errors
- Dependency conflicts
- Test failures

**Solutions:**
1. **Code Issues:**
   - Review error messages
   - Check syntax errors
   - Fix failing tests

2. **Dependencies:**
   - Update package versions
   - Resolve conflicts
   - Clear node_modules and reinstall

3. **Environment:**
   - Check environment variables
   - Verify build configuration
   - Test in clean environment

#### Problem: Deployment Errors
**Symptoms:**
- Deployment fails
- Application not accessible
- Configuration errors

**Solutions:**
1. **Configuration:**
   - Verify environment variables
   - Check deployment settings
   - Review build output

2. **Server Issues:**
   - Check server status
   - Verify permissions
   - Review server logs

3. **Rollback:**
   - Roll back to previous version
   - Identify deployment issue
   - Fix before redeploying

### Code Issues

#### Problem: TypeScript Errors
**Symptoms:**
- Type errors
- Compilation failures
- IDE warnings

**Solutions:**
1. **Type Definitions:**
   - Update type definitions
   - Check for missing imports
   - Review interface definitions

2. **Configuration:**
   - Verify tsconfig.json settings
   - Check path mappings
   - Update TypeScript version

#### Problem: API Endpoint Issues
**Symptoms:**
- 404 errors
- Request failures
- Response format issues

**Solutions:**
1. **Route Verification:**
   - Check route definitions
   - Verify HTTP methods
   - Review middleware configuration

2. **Request/Response:**
   - Validate request format
   - Check response headers
   - Review error handling

---

## Emergency Procedures

### System Outage

#### Immediate Response
1. **Assess Impact:**
   - Determine scope of outage
   - Identify affected systems
   - Estimate recovery time

2. **Communication:**
   - Notify stakeholders
   - Post status updates
   - Set up communication channels

3. **Recovery:**
   - Implement recovery plan
   - Monitor progress
   - Verify system integrity

#### Post-Incident
1. **Documentation:**
   - Record incident details
   - Document response actions
   - Create improvement plan

2. **Prevention:**
   - Implement fixes
   - Update monitoring
   - Review procedures

### Security Incident

#### Immediate Actions
1. **Containment:**
   - Isolate affected systems
   - Block suspicious IPs
   - Change compromised credentials

2. **Investigation:**
   - Collect evidence
   - Analyze logs
   - Identify root cause

3. **Recovery:**
   - Restore from clean backups
   - Patch vulnerabilities
   - Monitor for recurrence

### Data Loss

#### Recovery Procedures
1. **Assessment:**
   - Identify lost data
   - Determine recovery options
   - Estimate recovery time

2. **Recovery:**
   - Restore from backups
   - Reconstruct missing data
   - Verify data integrity

3. **Prevention:**
   - Implement better backup strategy
   - Add data validation
   - Review access controls

---

## Quick Reference

### Common Commands

```bash
# Application Management
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests
npm run lint         # Run linting

# Database Operations
npx prisma migrate dev    # Run migrations
npx prisma generate        # Generate client
npx prisma studio          # Open database studio
npx prisma db seed         # Seed database

# Docker Operations
docker-compose up -d      # Start services
docker-compose down        # Stop services
docker-compose logs -f     # View logs

# Process Management
pm2 start                  # Start with PM2
pm2 restart                # Restart application
pm2 logs                   # View logs
pm2 monit                  # Monitor processes
```

### Important Files

- `.env.local` - Environment variables
- `package.json` - Dependencies and scripts
- `prisma/schema.prisma` - Database schema
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration

### Contact Information

#### Support Channels
- **Technical Support**: support@upsamail.edu.gh
- **Database Admin**: dba@upsamail.edu.gh
- **Security Team**: security@upsamail.edu.gh
- **Emergency Contact**: emergency@upsamail.edu.gh

#### Documentation
- **API Docs**: `/docs/API.md`
- **Component Docs**: `/docs/COMPONENTS.md`
- **Database Schema**: `/docs/DATABASE_SCHEMA.md`
- **Environment Setup**: `/docs/ENVIRONMENT_SETUP.md`

### Monitoring Resources

#### Application Monitoring
- **Health Check**: `/api/health`
- **Metrics**: `/api/metrics`
- **Logs**: Application logs directory
- **Performance**: Browser dev tools

#### System Monitoring
- **Server Status**: System monitoring tools
- **Database**: Database monitoring dashboard
- **Network**: Network monitoring tools
- **Security**: Security monitoring alerts

This troubleshooting guide should help resolve most common issues with the UPSA Hostel Management System. For issues not covered here, please contact the appropriate support team.
