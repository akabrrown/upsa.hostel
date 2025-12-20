# User Guides - UPSA Hostel Management System

> **Version**: 2.0.0  
> **Last Updated**: December 19, 2025  
> **Document ID**: UPSA-HOSTEL-UG-001

> **Recent Changes**: Complete documentation rewrite based on actual system implementation

## Overview

This document provides comprehensive user guides for all user roles in the UPSA Hostel Management System. The system is built with Next.js 14, React 18, TypeScript, and Tailwind CSS, featuring role-based access control, unified authentication, and real-time data management.

### Technical Architecture

#### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.3.3
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.6
- **State Management**: Redux Toolkit 2.0.1
- **Form Handling**: Formik 2.4.5 with Yup validation
- **Animations**: GSAP 3.12.4
- **Icons**: Lucide React 0.303.0

#### Backend & Database
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with bcryptjs
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage

#### System Requirements

**Browser Requirements**
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

**Device Requirements**
- **Desktop**: Windows 10+, macOS 10.14+
- **Mobile**: iOS 13+, Android 8+
- **Internet**: Stable connection required

**Supported File Types**
- **Images**: JPEG, PNG (max 5MB)
- **Documents**: PDF (max 5MB)

## Table of Contents
- [Student Guide](#student-guide)
  - [Getting Started](#getting-started)
  - [Dashboard Features](#dashboard-features)
  - [Profile Management](#profile-management)
  - [Room Reservations](#room-reservations)
  - [Payment Management](#payment-management)
  - [Announcements](#announcements)
  - [Roommates](#roommates)
  - [Troubleshooting](#troubleshooting)
- [Admin Guide](#admin-guide)
  - [Getting Started](#getting-started-1)
  - [Student Management](#student-management)
  - [Room Management](#room-management)
  - [Payment Management](#payment-management-1)
  - [Porter Management](#porter-management)
  - [Announcements](#announcements-1)
  - [Reports and Analytics](#reports-and-analytics)
  - [System Settings](#system-settings)
  - [Troubleshooting](#troubleshooting-1)
- [Porter Guide](#porter-guide)
  - [Getting Started](#getting-started-2)
  - [Check-In/Check-Out Management](#check-incheck-out-management)
  - [Room Monitoring](#room-monitoring)
  - [Student Assistance](#student-assistance)
  - [Communication](#communication)
  - [Reports and Documentation](#reports-and-documentation)
  - [Troubleshooting](#troubleshooting-2)
- [Director Guide](#director-guide)
  - [Getting Started](#getting-started-3)
  - [Strategic Oversight](#strategic-oversight)
  - [Reports and Analytics](#reports-and-analytics-1)
  - [Compliance and Quality](#compliance-and-quality)
  - [Stakeholder Management](#stakeholder-management)
  - [Decision Support](#decision-support)
  - [Security and Emergency](#security-and-emergency)
  - [Troubleshooting](#troubleshooting-3)
- [Common Features](#common-features)
  - [Navigation](#navigation)
  - [Notifications](#notifications)
  - [File Management](#file-management)
  - [Help and Support](#help-and-support)
  - [System Requirements](#system-requirements)
  - [Best Practices](#best-practices)
  - [Troubleshooting Common Issues](#troubleshooting-common-issues)
  - [Training and Development](#training-and-development)
  - [System Updates](#system-updates)
  - [Feedback and Improvement](#feedback-and-improvement)
- [Contact Information](#contact-information)

---

## Student Guide

### Getting Started

#### 1. Account Registration
1. Navigate to the hostel management system URL
2. Click "Sign Up" on the login page
3. Fill in the registration form:
   - **Index Number**: 8-digit student ID (without UPSA prefix)
   - **Date of Birth**: Your date of birth (used as initial password)
   - **Phone Number**: Contact phone number
   - **UPSA Email Address**: @upsamail.edu.gh email address
4. Click "Create Account"
5. Your account will be created with your date of birth as the temporary password
6. Log in with your index number and date of birth
7. Change your password after first login for security

#### 2. Unified Login System
The system uses a single login page for all users (students and staff). The system automatically detects your user type based on your login credentials.

**For Students:**
1. Enter your 8-digit index number (without UPSA prefix) in the "Email or Index Number" field
2. Enter your date of birth (format: YYYY-MM-DD) in the "Password or Date of Birth" field
3. Click "Sign In"
4. You'll be automatically redirected to your student dashboard

**Important Notes:**
- No role selection is required - the system detects your role automatically
- The second field label changes dynamically based on your input type
- Students use index number + date of birth format
- Staff use email + password format

### Dashboard Features

#### Overview
The student dashboard provides:
- Personal information summary
- Current room allocation status
- Payment status and history
- Recent announcements
- Quick actions for reservations and bookings

#### Navigation Menu
Available navigation options for students:
- **Dashboard**: Home page with overview
- **Profile**: Personal information management
- **Reservations**: Room booking and allocation
- **Payments**: View payment history and make payments
- **Announcements**: View system announcements
- **Roommates**: View assigned roommates
- **Room Booking**: Book new rooms
- **Room Reservation**: Reserve specific rooms

### Profile Management

#### Viewing Profile Information
1. Go to **Profile** from the navigation menu
2. View your personal information:
   - **Personal Information**: Name, index number, date of birth, gender
   - **Contact Information**: Email, phone, emergency contact
   - **Academic Information**: Program, year of study, student ID
   - **Accommodation**: Hostel, room, bed details (if allocated)

#### Data Availability
**Important Note**: Some personal details may show "Not Available" until the school database integration is implemented. This is normal and will be updated automatically when the integration is complete.

#### Changing Password
1. Go to **Profile** → **Security Settings**
2. Click "Change Password"
3. Enter current password
4. Enter new password (must be at least 6 characters)
5. Confirm new password
6. Click "Update Password"
7. You will need to log in again with your new password

#### Password Reset
1. Go to the login page
2. Click "Forgot Password" link
3. Enter your 8-digit index number
4. Click "Reset Password"
5. Your password will be reset to your default password (date of birth)
6. Log in with your index number and date of birth
7. Change your password immediately for security

### Room Reservations

#### Viewing Available Rooms
1. Go to **Reservations** → **Available Rooms**
2. Filter rooms by:
   - Hostel preference
   - Room type (single, double, etc.)
   - Price range
3. Click on any room to view details:
   - Room capacity
   - Amenities
   - Current occupants
   - Price per semester

#### Making a Reservation
1. Select an available room
2. Click "Reserve Room"
3. Review reservation details
4. Accept terms and conditions
5. Submit reservation request
6. Wait for admin approval

#### Room Booking Process
1. Go to **Room Booking** from navigation
2. Browse available hostels and rooms
3. Select preferred room type
4. Fill in booking form with preferences
5. Submit booking request
6. Track booking status in **Reservations** section

#### Viewing Reservation Status
1. Go to **Reservations** → **My Reservations**
2. View status:
   - **Pending**: Awaiting admin approval
   - **Approved**: Reservation confirmed
   - **Rejected**: Request denied
   - **Cancelled**: Reservation cancelled

### Payment Management

#### Viewing Payment History
1. Go to **Payments** → **Payment History**
2. View all past payments with:
   - Payment date
   - Amount
   - Payment method
   - Semester
   - Receipt number

#### Making Online Payments
1. Go to **Payments** → **Make Payment**
2. Select semester and academic year
3. Choose payment method:
   - Bank transfer
   - Mobile money
   - Credit card
4. Enter payment details
5. Confirm payment
6. Save receipt

#### Payment Status
- **Paid**: All fees cleared
- **Partial**: Partial payment made
- **Pending**: Payment awaiting confirmation
- **Overdue**: Payment deadline passed

### Announcements

#### Viewing Announcements
1. Go to **Announcements**
2. Filter by:
   - Category (General, Academic, Payment, etc.)
   - Priority (Low, Medium, High, Urgent)
   - Date range
3. Click on announcement to view full details

#### Announcement Types
- **General**: General hostel information
- **Academic**: Academic calendar updates
- **Payment**: Payment reminders and deadlines
- **Maintenance**: Facility maintenance notices
- **Emergency**: Urgent announcements

### Roommates

#### Viewing Roommates
1. Go to **Roommates**
2. View assigned roommates:
   - Name and program
   - Contact information
   - Room allocation details

#### Roommate Communication
- View roommate contact details
- Send messages through the system
- Coordinate room activities

### Troubleshooting

#### Common Issues
1. **Login Problems**
   - Check index number format (8 digits) and date of birth format (YYYY-MM-DD)
   - The system automatically detects your role - no manual selection needed
   - Try resetting password if forgotten

2. **Registration Issues**
   - Ensure index number is 8 digits (without UPSA prefix)
   - Verify email format (@upsamail.edu.gh)
   - Check date of birth format
   - Contact admin if account creation fails

3. **Password Issues**
   - Default password is date of birth
   - Use index number to reset password to default (date of birth)
   - Change default password immediately after first login
   - Ensure password meets minimum requirements (6+ characters)

4. **Profile Data Issues**
   - "Not Available" indicates missing data from school database
   - This will be resolved automatically when database integration is complete
   - Contact admin if critical information is missing

5. **System Access Issues**
   - Clear browser cache and cookies
   - Try different browser
   - Check internet connection
   - Verify account is active

#### Getting Help
- Contact: student-support@upsamail.edu.gh
- Phone: +233-XXX-XXXX-XXXX
- Visit: Student Affairs Office

---

## Admin Guide

### Getting Started

#### 1. Admin Account Setup
1. Contact system administrator for admin credentials
2. Log in with admin credentials:
   - **Email**: Your admin email address
   - **Password**: Your secure password
   - **System**: The unified login page will automatically detect your admin role
3. Complete initial setup and security configuration

#### 2. Admin Dashboard Overview
The admin dashboard provides:
- System statistics and metrics
- Quick access to all modules
- Recent activities and logs
- System alerts and notifications
- Real-time data visualization

### Student Management

#### Viewing All Students
1. Go to **Students** → **All Students**
2. View student list with:
   - Index number
   - Name and email
   - Program and level
   - Room allocation
   - Payment status
3. Use search and filters to find specific students

#### Adding New Students
1. Go to **Students** → **Add Student**
2. Fill in student information:
   - Personal details
   - Academic information
   - Contact information
3. Assign initial room allocation (optional)
4. Click "Create Student"

#### Editing Student Information
1. Find student in student list
2. Click "Edit" next to student name
3. Update information as needed
4. Click "Save Changes"

#### Deactivating Students
1. Select student from list
2. Click "Deactivate"
3. Confirm deactivation
4. Student loses system access

### Room Management

#### Managing Hostels
1. Go to **Rooms** → **Hostels**
2. View all hostels with capacity
3. Add new hostels as needed
4. Edit hostel information

#### Adding Rooms
1. Go to **Rooms** → **Add Room**
2. Enter room details:
   - Hostel and floor
   - Room number
   - Capacity and room type
   - Price per semester
   - Available amenities
3. Click "Create Room"

#### Room Allocation
1. Go to **Rooms** → **Allocation**
2. View current allocations
3. Click "New Allocation"
4. Select student and room
5. Set allocation period
6. Confirm allocation

#### Room Maintenance
1. Go to **Rooms** → **Maintenance**
2. Report maintenance issues
3. Track repair progress
4. Update maintenance status

### Payment Management

#### Viewing Payment Records
1. Go to **Payments** → **All Payments**
2. Filter by:
   - Date range
   - Payment status
   - Student
   - Semester
3. Export payment reports

#### Processing Payments
1. Go to **Payments** → **Process Payment**
2. Select student
3. Enter payment details:
   - Amount
   - Payment method
   - Semester
   - Receipt number
4. Confirm payment

#### Payment Reminders
1. Go to **Payments** → **Reminders**
2. Set up automatic reminders
3. Customize reminder messages
4. Schedule reminder frequency

### Porter Management

#### Managing Porters
1. Go to **Porters** → **All Porters**
2. View porter assignments
3. Add new porters
4. Assign hostels and shifts

#### Porter Scheduling
1. Go to **Porters** → **Schedule**
2. Create work schedules
3. Assign shifts
4. Track attendance

### Announcements

#### Creating Announcements
1. Go to **Announcements** → **Create**
2. Fill in announcement details:
   - Title and content
   - Category and priority
   - Target audience
   - Publication date
3. Schedule publication
4. Publish announcement

#### Managing Announcements
1. Go to **Announcements** → **Manage**
2. View all announcements
3. Edit or delete announcements
4. Archive old announcements

### Reports and Analytics

#### Generating Reports
1. Go to **Reports** → **Generate Report**
2. Select report type:
   - Occupancy report
   - Payment report
   - Student demographics
   - Porter activities
3. Set date range and filters
4. Choose format (PDF, Excel, CSV)
5. Generate and download report

#### Viewing Analytics
1. Go to **Analytics** → **Dashboard**
2. View system metrics:
   - Occupancy rates
   - Payment statistics
   - Student demographics
   - System usage

### System Settings

#### General Settings
1. Go to **Settings** → **General**
2. Configure:
   - Academic calendar
   - Fee structures
   - System preferences

#### Security Settings
1. Go to **Settings** → **Security**
2. Configure:
   - Password policies
   - Session timeout
   - Access controls

#### Email Settings
1. Go to **Settings** → **Email**
2. Configure:
   - SMTP settings
   - Email templates
   - Notification preferences

### Troubleshooting

#### Common Admin Issues
1. **Student Data Problems**
   - Verify data accuracy
   - Check for duplicates
   - Validate index numbers

2. **Room Allocation Issues**
   - Check room availability
   - Verify student eligibility
   - Review allocation rules

3. **Payment Processing Issues**
   - Verify payment details
   - Check system integration
   - Review payment logs

#### System Maintenance
- Regular data backups
- Database optimization
- Security updates
- Performance monitoring

---

## Porter Guide

### Getting Started

#### 1. Porter Account Setup
1. Receive credentials from admin
2. Log in with porter credentials:
   - **Email**: Your porter email address
   - **Password**: Your secure password
   - **System**: The unified login page will automatically detect your porter role
3. Complete profile setup and training

#### 2. Porter Dashboard
The porter dashboard shows:
- Assigned hostels and floors
- Today's check-ins/check-outs
- Recent activities
- Announcements
- Quick access to check-in/out tools

### Check-In/Check-Out Management

#### Student Check-In
1. Go to **Check-In** → **New Check-In**
2. Search for student by:
   - Index number
   - Name
   - Room number
3. Verify student identity
4. Record check-in details:
   - Check-in time
   - Purpose of entry
   - Notes (if any)
5. Confirm check-in

#### Student Check-Out
1. Go to **Check-Out** → **New Check-Out**
2. Find student in system
3. Verify check-out authorization
4. Record check-out details:
   - Check-out time
   - Reason for leaving
   - Expected return time
5. Confirm check-out

#### Viewing Check-In History
1. Go to **History** → **Check-Ins**
2. Filter by:
   - Date range
   - Student
   - Hostel/Floor
3. Export reports as needed

### Room Monitoring

#### Room Status Updates
1. Go to **Rooms** → **Room Status**
2. View assigned rooms
3. Update room conditions:
   - Cleanliness status
   - Maintenance needs
   - Occupancy status
4. Report issues to admin

#### Maintenance Reporting
1. Go to **Maintenance** → **Report Issue**
2. Select room and issue type
3. Describe the problem
4. Set priority level
5. Submit report
6. Track resolution progress

### Student Assistance

#### Student Inquiries
1. Go to **Students** → **Inquiries**
2. View student questions
3. Provide assistance:
   - Room information
   - Facility directions
   - Policy explanations
4. Log interaction details

#### Emergency Response
1. Go to **Emergency** → **Response**
2. Report emergency situations
3. Contact appropriate authorities
4. Document incident details
5. Follow up on resolution

### Communication

#### Announcements
1. Go to **Announcements** → **Create**
2. Create announcements for:
   - Floor-specific notices
   - Maintenance alerts
   - Safety reminders
3. Target specific student groups
4. Publish announcements

#### Message Students
1. Go to **Messages** → **Compose**
2. Select recipients:
   - Individual students
   - Room groups
   - Floor groups
3. Write message
4. Send immediately or schedule

### Reports and Documentation

#### Daily Reports
1. Go to **Reports** → **Daily Log**
2. Record daily activities:
   - Check-ins/check-outs
   - Incidents
   - Maintenance requests
3. Submit end-of-shift report

#### Incident Reports
1. Go to **Reports** → **Incident Report**
2. Document incidents:
   - Date and time
   - Involved parties
   - Description
   - Resolution
3. Submit to admin

### Troubleshooting

#### Common Porter Issues
1. **Check-In Problems**
   - Verify student identity
   - Check room assignment
   - Contact admin for issues

2. **System Access Issues**
   - Verify credentials
   - Check internet connection
   - Contact IT support

3. **Emergency Situations**
   - Follow emergency procedures
   - Contact security immediately
   - Document all actions

#### Getting Help
- Contact: porter-support@upsamail.edu.gh
- Phone: +233-XXX-XXXX-XXXX
- On-site: Admin Office

---

## Director Guide

### Getting Started

#### 1. Director Account Setup
1. Receive system credentials from IT administration
2. Log in with director credentials:
   - **Email**: Your director email address
   - **Password**: Your secure password
   - **System**: The unified login page will automatically detect your director role
3. Complete initial configuration and security setup

#### 2. Director Dashboard
The director dashboard provides:
- System overview statistics
- Key performance indicators
- Recent activities
- Strategic insights
- Executive-level analytics

### Strategic Oversight

#### System Performance Monitoring
1. Go to **Overview** → **Performance**
2. Monitor key metrics:
   - Occupancy rates
   - Revenue collection
   - Student satisfaction
   - Operational efficiencymidt

#### BudgetIAS Budget Management
ductive
1Control
1. . Go to;** → **Budget**
2
#### Reports and设备及 Analytics

      - Review budget allocationsKey allocations
 
- Monitor"}
- Monitor 
- Generate financial reports 
- 

#### 
- 

#### 
-Startup
- 
- 

- 

- 

- 

- 

- 

 
- 

- 

-__;** → **chedu
-	- 
- 
- 
- 
- 
- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 

- 
- . 

- 
-[]. 

- 
 

-数的

 

-[]. 

 
 

 

-,copy

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

  
 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 


 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

[]. 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 
- 

 . 

 

 

販

 

一步

 

 
 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

。，

 

 

 
 

 

 
 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 
- 

.''

 

 

 
 

 

__;** → **Reports**
2. Generate comprehensive reports:
   - Monthly performance
   - Quarterly reviews
   - Annual summaries
3. Customize report parameters
4. Export in preferred format

#### Trend Analysis
1. Go to **Analytics** → **Trends**
2. Analyze historical data:
   - Enrollment trends
   - Payment patterns
   - Facility utilization
   - Student satisfaction

#### Comparative Analysis
1. Go to **Analytics** → **Comparisons**
2. Compare metrics across:
   - Different hostels
   - Academic years
   - Student demographics
3. Identify improvement opportunities

### Compliance and Quality

#### Compliance Monitoring
1. Go to **Compliance** → **Monitor**
2. Track regulatory compliance
3. Review audit findings
4. Implement corrective actions
5. Document compliance efforts

#### Quality Assurance
1. Go to **Quality** → **Assurance**
2. Monitor service quality
3. Review student feedback
4. Implement improvements
5. Track quality metrics

### Stakeholder Management

#### Student Relations
1. Go to **Students** → **Relations**
2. Review student feedback
3. Address student concerns
4. Implement improvement initiatives
5. Monitor satisfaction levels

#### Staff Management
1. Go to **Staff** → **Management**
2. Review staff performance
3. Approve staff appointments
4. Monitor staff development
5. Address personnel issues

#### External Relations
1. Go to **External** → **Relations**
2. Manage partner relationships
3. Coordinate with university departments
4. Handle external communications
5. Represent hostel management

### Decision Support

#### Data-Driven Decisions
1. Go to **Decisions** → **Analytics**
2. Review relevant data
3. Analyze options
4. Make informed decisions
5. Track decision outcomes

#### Strategic Planning
1. Go to **Planning** → **Strategy**
2. Review strategic goals
3. Develop action plans
4. Monitor implementation
5. Adjust strategies as needed

### Security and Emergency

#### Security Oversight
1. Go to **Security** → **Oversight**
2. Review security protocols
3. Monitor incident reports
4. Approve security improvements
5. Ensure emergency preparedness

#### Emergency Management
1. Go to **Emergency** → **Management**
2. Review emergency procedures
3. Coordinate emergency response
4. Communicate with stakeholders
5. Document emergency events

### Troubleshooting

#### Common Director Issues
1. **Data Accuracy Problems**
   - Verify data sources
   - Cross-reference reports
   - Consult with admin team

2. **Strategic Decision Issues**
   - Gather additional data
   - Consult stakeholders
   - Consider multiple perspectives

3. **Compliance Issues**
   - Review regulations
   - Consult legal counsel
   - Implement corrective actions

#### Getting Help
- Contact: director-support@upsamail.edu.gh
- Phone: +233-XXX-XXXX-XXXX
- Executive Assistant: +233-XXX-XXXX-XXXX

---

## Common Features

### Navigation

#### Main Menu Structure
The system uses role-based navigation with the following main sections:

**For Students:**
- **Dashboard**: Home page with overview
- **Profile**: Personal information management
- **Reservations**: Room booking and allocation
- **Payments**: View payment history and make payments
- **Announcements**: View system announcements
- **Roommates**: View assigned roommates

**For Admin:**
- **Dashboard**: System overview and statistics
- **Students**: Student management and records
- **Rooms**: Room and hostel management
- **Payments**: Payment processing and records
- **Porters**: Porter management and scheduling
- **Announcements**: System communications
- **Settings**: System configuration

**For Porters:**
- **Dashboard**: Daily overview and tasks
- **Check-In/Check-Out**: Student movement tracking
- **Rooms**: Room status monitoring
- **Reports**: Daily logs and incident reports

**For Directors:**
- **Dashboard**: Executive overview
- **Reports**: Strategic analytics
- **Analytics**: Performance metrics
- **Compliance**: Quality and regulatory monitoring

#### Search Functionality
- Global search across all modules
- Advanced filtering options
- Saved search preferences
- Export search results

### Notifications

#### Notification Types
- **System Notifications**: System updates and maintenance
- **Action Notifications**: Tasks requiring attention
- **Information Notifications**: General information
- **Emergency Notifications**: Urgent alerts

#### Managing Notifications
1. Click notification bell icon in navbar
2. View all notifications
3. Mark as read/unread
4. Delete old notifications
5. Configure notification preferences

### File Management

#### Supported File Types
- **Images**: JPEG, PNG (max 5MB)
- **Documents**: PDF (max 5MB)

#### File Upload Process
1. Click "Upload" button in relevant section
2. Select file from device
3. Wait for upload confirmation
4. Verify file details

### Best Practices

#### Security Best Practices
1. Use strong, unique passwords
2. Log out when finished
3. Don't share credentials
4. Report suspicious activity
5. Keep software updated

#### Usage Best Practices
1. Save work frequently
2. Verify data before submission
3. Use appropriate channels for communication
4. Follow established procedures
5. Provide feedback for improvements

### Troubleshooting Common Issues

#### Login Problems
- Check credentials (index number + DOB for students, email + password for staff)
- The system automatically detects your role - no manual selection needed
- Clear browser cache
- Try different browser
- Contact support if needed

#### Performance Issues
- Check internet connection
- Clear browser cache
- Close unnecessary tabs
- Try during off-peak hours

#### Data Issues
- Verify data entry
- Check for duplicates
- Review validation rules
- Contact admin for corrections

#### Profile Data Issues
- "Not Available" indicates missing data from school database
- This will be resolved automatically when database integration is complete
- Contact admin if critical information is missing

### Training and Development

#### Available Training
- **Basic Training**: System overview and navigation
- **Role-Specific Training**: Detailed feature training
- **Advanced Training**: Power user features
- **Refresher Training**: Periodic updates

#### Training Resources
- **Video Tutorials**: Step-by-step guides
- **User Manuals**: Comprehensive documentation
- **Webinars**: Live training sessions
- **Workshops**: Hands-on training

### System Updates

#### Update Schedule
- **Regular Updates**: Monthly maintenance
- **Feature Updates**: Quarterly releases
- **Security Updates**: As needed
- **Major Updates**: Semi-annual

#### Update Process
1. System notification of upcoming updates
2. Scheduled maintenance windows
3. Backup of critical data
4. Update installation
5. System verification
6. User notification of completion

### Feedback and Improvement

#### Providing Feedback
1. Use in-app feedback form
2. Send email to feedback@upsamail.edu.gh
3. Contact system administrator
4. Participate in user surveys

#### Improvement Process
1. Feedback collection
2. Analysis and prioritization
3. Development planning
4. Implementation
5. User notification
6. Follow-up evaluation

---

## Contact Information

### General Support
- **Email**: support@upsamail.edu.gh
- **Phone**: +233-XXX-XXXX-XXXX
- **Office**: System Administration Office

### Role-Specific Support
- **Student Support**: student-support@upsamail.edu.gh
- **Admin Support**: admin-support@upsamail.edu.gh
- **Porter Support**: porter-support@upsamail.edu.gh
- **Director Support**: director-support@upsamail.edu.gh

### Emergency Contacts
- **System Emergency**: emergency@upsamail.edu.gh
- **Security**: +233-XXX-XXXX-XXXX
- **IT Emergency**: it-emergency@upsamail.edu.gh

### Office Hours
- **Monday - Friday**: 8:00 AM - 6:00 PM
- **Saturday**: 9:00 AM - 2:00 PM
- **Sunday**: Closed
- **Emergency Support**: 24/7

### Additional Resources
- **Online Help**: [help.upsa.edu.gh](https://help.upsa.edu.gh)
- **Video Tutorials**: [tutorials.upsa.edu.gh](https://tutorials.upsa.edu.gh)
- **FAQ**: [faq.upsa.edu.gh](https://faq.upsa.edu.gh)
- **System Status**: [status.upsa.edu.gh](https://status.upsa.edu.gh)

---

## Technical Documentation

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/signup` - User registration
- `GET /api/auth/secure-login` - Secure login validation

#### Student APIs
- `GET /api/students/bookings` - Student bookings
- `GET /api/students/reservations` - Student reservations
- `GET /api/profile` - User profile data

#### Admin APIs
- `GET /api/admin/students` - All student data
- `GET /api/admin/accounts` - Admin accounts
- `GET /api/admin/rooms` - Room management
- `GET /api/admin/payments` - Payment records
- `GET /api/admin/announcements` - Announcements

#### Porter APIs
- `GET /api/porter/checkin` - Check-in records
- `POST /api/porter/checkin` - New check-in

#### General APIs
- `GET /api/hostels` - Hostel information
- `GET /api/rooms` - Room details
- `GET /api/payments` - Payment data
- `GET /api/announcements` - System announcements
- `GET /api/notifications` - User notifications

### Database Schema

#### User Tables
- **users**: Basic user information and authentication
- **profiles**: Extended user profile data
- **accommodations**: Room allocation data

#### System Tables
- **hostels**: Hostel information
- **rooms**: Room details and availability
- **payments**: Payment records and transactions
- **announcements**: System announcements
- **notifications**: User notifications

#### Activity Tables
- **checkins**: Student check-in/out records
- **bookings**: Room booking requests
- **reservations**: Room reservations
- **maintenance**: Maintenance requests and records

### Security Features

#### Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Session management
- Automatic logout on inactivity

#### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

#### Access Control
- Role-based access control (RBAC)
- Route protection
- API endpoint security
- File upload validation

### Performance Optimizations

#### Frontend
- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Bundle optimization

#### Backend
- Database indexing
- API response caching
- Query optimization
- Connection pooling

#### Monitoring
- Performance metrics
- Error tracking
- User analytics
- System health monitoring

---

*This documentation is maintained by the UPSA Hostel Management System development team and is regularly updated to reflect system changes and improvements.*
